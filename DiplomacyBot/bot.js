var Discord = require('discord.js');
var auth = require('./auth.json');
var request = require('request');
var parser = require('cheerio-tableparser');
var fs = require('fs');
const cheerio = require('cheerio');

var state = require('./state.json')[0];
var site = "https://webdiplomacy.net/";

var channelID;




var siteContent;



// Initialize Discord Bot
var client = new Discord.Client();

client.on('ready', function (evt) {
    console.log("Connected");

    for (var channel in client.channels) {
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
            //saving the new data
            fs.writeFile('state.json', JSON.stringify([state], null, 2), 'utf8', function (err) {
                if (err) throw err;
            });
        }

    });
    console.log("loading complete");
});

client.on('message', function (user, userID, channelID, message, evt) {
    if (evt.d.mentions.length != 0 && evt.d.mentions[0].id == bot.id) {

        var args = message.split(" ");
        var cmd = args[1];
        args = args.slice(2, args.length - 1).join(" ");

        switch (cmd) {
           
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'pong'
                });
                break;
            case 'standing':
                bot.sendMessage({
                    to: channelID,
                    message: 'Current standing as of '+ state.Date.replace("-", " "),
                    embed: {
                        "fields": leaderBoardbuilder()
                    }
                });
                break;
            case 'map':
                var src = site + "map.php?gameID=" + state.GameID + "&turn=" + getLatestMapIndex()

                // console.log(src);

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
    client.sendMessage({
        to: channelID,
        message: m
    });
}

function leaderBoardbuilder() {
    var array = [];
    for (var player in state.Leaderboard) {
        elm = {
            name: "Country: " + state.Leaderboard[player].country + ", Player by: " + state.Leaderboard[player].name,
            value: "Supply-Centers: " + state.Leaderboard[player].supply_centers + ", Units: " + state.Leaderboard[player].units
        }
        array.push(elm);
    }
    return array;
}


function httpGet(callback) {
    request(site + "board.php?gameID=" + state.GameID, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });

}


client.login(auth.token);

