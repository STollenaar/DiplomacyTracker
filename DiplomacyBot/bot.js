const { Client, RichEmbed } = require('discord.js');
const auth = require('./auth.json');
const request = require('request');
const parser = require('cheerio-tableparser');
const fs = require('fs');
const cheerio = require('cheerio');


let state = require('./state.json');
let game = state.Games[0];
const site = "https://webdiplomacy.net/";

let channel = new Map();
let siteContent;


const mapHandler = require('./mapCommand').init(RichEmbed, game);
const leadboardHandler = require('./leaderboardCommand').init(RichEmbed, game);

// Initialize Discord Bot
const client = new Client();

client.on('ready', function (evt) {
    console.log("Connected");

    if (state.Debug) {
        for (let guild in client.guilds.array()) {
            if (client.guilds.array()[guild].id === state.DebugServer) {
                let cTemp = client.guilds.array()[guild].channels.find(ch => ch.name === "diplomacy");
                channel.set(cTemp.guild.id, cTemp);
                break;
            }
        }
    } else {
        let cTemp = client.channels.find(ch => ch.name === "diplomacy");
        channel.set(cTemp.guild.id, cTemp);
    }

    httpGet(function (response) {
        siteContent = response;

        const $ = cheerio.load(siteContent);

        //checking if the data is current
        if (game.Date.replace("-", ", ") !== $('span.gameDate').text()) {
            game.Date = $('span.gameDate').text().replace(", ", "-");
            channel.send("Date is now " + game.Date.replace("-", ", "));

            parser($);
            let members = $('.membersFullTable').parsetable(false, false, true);

            for (var i = 0; i < members[0].length; i++) {
                //some weird data is undefined
                if (members[1][i * 2] === undefined) {
                    break;
                }
                //getting the player data
                let country = members[0][i * 2];
                let data = members[1][i * 2].split(",");
                let name = data[0].split("(")[0].trim();
                let supply_centers = data[1].split(" ")[3];
                let units = data[2];

                let found = false;

                for (let p in state.Leaderboard) {
                    //updating player data
                    if (p.name === name) {
                        found = true;
                        if (p.supply_centers !== supply_centers) {
                            p.supply_centers = supply_centers;
                        }
                        if (p.units !== units) {
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
                    };
                    game.Leaderboard.push(player);
                }

            }
            //saving the new data
            state.Games[0] = game;
            fs.writeFile('state.json', JSON.stringify(state, null, 2), 'utf8', function (err) {
                if (err) throw err;
            });
        }

    });
    console.log("loading complete");
});


//reacting on certain commands
client.on('message', message => {
    if (channel.get(message.guild.id) !== undefined && message.channel.id === channel.get(message.guild.id).id) {
        if (message.isMentioned(client.user.id)) {

            let args = message.content.split(" ");
            let cmd = args[1];
            args = args.slice(2, args.length - 1).join(" ");

            switch (cmd) {

                case 'ping':
                    channel.get(message.guild.id).send('pong');
                    break;
                case 'leaderboard':
                case 'standing':
                    leadboardHandler.CommandHandler(message);
                    break;
                case 'map':
                    mapHandler.CommandHandler(message);
                    break;
                case 'help':
                default:
                    helpCommandHandler(message);
                    break;
            }
        }
    }
});

//simple help handler
function helpCommandHandler(message) {
    let embed = new RichEmbed();
    embed.setTitle("Commands:");
    embed.addField("ping", "returns pong.. good for testing if the bot is dead.");
    embed.addField("leaderboard/standing", "returns the current standing. Able to sort on different things.");
    embed.addField("map", "Shows you the current map. Able to scroll through the different turns.");

    channel.send(embed);
}

function httpGet(callback) {
    request(site + "board.php?gameID=" + game.GameID, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });

}


client.login(auth.token);

