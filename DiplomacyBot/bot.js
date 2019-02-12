var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var parser = require('cheerio-tableparser');
var fs = require('fs');
const cheerio = require('cheerio');

var state = require('./state.json')[0];
var site = "https://webdiplomacy.net/";

var channelID;




var siteContent;


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');

    for (var channel in bot.channels) {
        if (bot.channels[channel].name == "diplomacy") {
            channelID = channel;
            break;
        }
    }

    httpGet(function (response) {
        siteContent = response;

        const $ = cheerio.load(siteContent);

        //checking if the data is current
        if (state.Date.replace("-", ", ") != $('span.gameDate').text()) {
            state.Date = $('span.gameDate').text().replace(", ", "-");
            botSendMessage("Date is now " + state.Date.replace("-", ", "));

            parser($);
            var members = $('.membersFullTable').parsetable(false, false, true);

            for (var i = 0; i < members[0].length; i++) {
                //some weird data is undefined
                if (members[1][i * 2] == undefined) {
                    break;
                }
                //getting the player data
                var country = members[0][i * 2];
                var data = members[1][i * 2].split(",");
                var name = data[0].split("(")[0].trim();
                var supply_centers = data[1].split(" ")[3];
                var units = data[2];

                var found = false;

                for (var p in state.Leaderboard) {
                    //updating player data
                    if (p.name == name) {
                        found = true;
                        if (p.supply_centers != supply_centers) {
                            p.supply_centers = supply_centers;
                        }
                        if (p.units != units) {
                            p.units = units;
                        }
                    }
                }
                if (!found) {
                    //adding new player data
                    let player = {
                        "name": name,
                        "country": country,
                        "supply_centers": supply_centers,
                        "units": units
                    }
                    state.Leaderboard.push(player);
                }

            }

            fs.writeFile('state.json', JSON.stringify([state], null, 2), 'utf8', function (err) {
                if (err) throw err;
            });
        }

    });
    console.log("loading complete");
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (evt.d.mentions.length != 0 && evt.d.mentions[0].id == bot.id) {

        var args = message.split(" ");
        var cmd = args[1];
        args = args.slice(2, args.length - 1).join(" ");

        switch (cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'pong'
                });
                break;
            case 'leaderboard':
            case 'standing':
                bot.sendMessage({
                    to: channelID,
                    message: '',
                    embed: {
                        "fields": state.Leaderboard
                    }
                });
                break;
            case 'map':
                var src = site + "map.php?gameID=" + state.GameID + "&turn=" + getLatestMapIndex()
                console.log(src);
                bot.sendMessage({
                    to: channelID,
                    message: '',
                    embed: {
                        "image": {
                            "url": src
                        }
                    }
                });
                break;
            default:
                bot.sendMessage(args);
                break;
        }
    }
});

//gets a correct map index
function getLatestMapIndex() {
    var season = state.Date.split("-")[0];
    var year = state.Date.split("-")[1];

    return (year - state.startYear) * 2 + (season == state.startSeason ? 0 : 1);

}

function botSendMessage(m) {
    bot.sendMessage({
        to: channelID,
        message: m
    });
}



function httpGet(callback) {
    request(site + "board.php?gameID=" + state.GameID, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });

}

