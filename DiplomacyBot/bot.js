const { Client, RichEmbed } = require('discord.js');
const auth = require('./auth.json');



let state = require('./state.json');
let game = state.Games[0];


let channel = new Map();

let scheduler;
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
    scheduler = require('./scheduler').init(state, channel, mapHandler, leadboardHandler);
    
    console.log("loading complete");
});


//reacting on certain commands
client.on('message', message => {
    if (channel.get(message.guild.id) !== undefined && message.channel.id === channel.get(message.guild.id).id) {
        if (message.isMentioned(client.user.id)) {

            let args = message.content.split(" ");
            let cmd = args[1];

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
                case 'subscribe':
                case 'unsubscribe':
                    scheduler.subParser(message);
                    break;
                case 'saveState':
                    if (message.channel.guild.id === state.DebugServer) {
                        scheduler.saveState();
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

    message.reply(embed);
}




client.login(auth.token);

