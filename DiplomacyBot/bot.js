const { Client, RichEmbed } = require('discord.js');
const config = require('./config.json');

let scheduler;
const database = require('./database');

const mapHandler = require('./mapCommand').init(RichEmbed, database);
const leadboardHandler = require('./leaderboardCommand').init(RichEmbed, database);



// Initialize Discord Bot
const client = new Client();



client.on('ready', function (evt) {
    console.log("Connected");

    scheduler = require('./scheduler').init(database, client, config, mapHandler, leadboardHandler, RichEmbed);

    console.log("loading complete");
});


//reacting on certain commands
client.on('message', message => {
    if (message.channel.name === "diplomacy") {
        if (message.isMentioned(client.user.id)) {

            let args = message.content.split(" ");
            let cmd = args[1];
            args = args.slice(2, args.length);

            switch (cmd) {

                case 'ping':
                    message.reply('pong');
                    break;
                case 'leaderboard':
                case 'standing':
                    leadboardHandler.CommandHandler(message);
                    break;
                case 'map':
                    mapHandler.CommandHandler(message);
                    break;
                case 'subscribe':
                case 'unsubscribe':
                    scheduler.subParser(message);
                    break;
                case 'addGame':
                    if (message.channel.guild.id === config.DebugServer) {
                        if (args.length === 3 && !isNaN(args[0]) && !isNaN(args[1]) && isNaN(args[3])) {
                            scheduler.addGame(args[0], args[1], args[2]);
                        }
                    }
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
    embed.addField("subscribe", "Allows you to subscribe to a player. You will be notified every hour if you need to make a move.");
    embed.addField("unsubscribe", "Removes you from the subscription of a player.");

    message.reply(embed);
}




client.login(config.AuthTkn);

