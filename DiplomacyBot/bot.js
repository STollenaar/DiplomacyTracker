var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var parser = require('cheerio-tableparser');

var fs = require('fs');

var channelID;

const cheerio = require('cheerio');

var state = require('./state.json');
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
        console.log("site set");
        siteContent = response;

        const $ = cheerio.load(siteContent);

        //checking if the data is current
        if (state.Date.replace("-", ", ") != $('span.gameDate').text().replace) {
            state.Date = $('span.gameDate').text();
            botSendMessage("Date is now " + state.Date);

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

            fs.writeFile('state.json', JSON.stringify(state, null, 2), 'utf8', function (err) {
                if (err) throw err;
            });
        }

    });
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                botSendMessage("pong");
                // Just add any case commands if you want to..
                break;
            case 'site':
                console.log(siteContent);
                break;
        }
    }
});


function botSendMessage(m) {
    bot.sendMessage({
        to: channelID,
        message: m
    });
}



function httpGet(callback) {
    request("https://webdiplomacy.net/board.php?gameID=236023", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });

}

