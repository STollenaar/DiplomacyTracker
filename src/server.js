// eslint-disable-next-line node/no-missing-require
'use strict';

// eslint-disable-next-line node/no-missing-require
const {Client, RichEmbed} = require('discord.js');
const fs = require('fs');

const database = require('./database');
const leadboardHandler = require('./commands/leaderboard').init(RichEmbed, database);

let config;
let scheduler;
let mapHandler;

// Initialize Discord Bot
const client = new Client();

const main = () => {
	// eslint-disable-next-line promise/prefer-await-to-callbacks
	fs.stat(__dirname.concat('/config.json'), async (err) => {
		if (err) {
			console.log('Deploying config');
			await database.defaultConfig(fs);
			config = require('./config.json');
		}
		else {
			config = require('./config.json');
		}
		client.login(config.AuthTkn);
	});
};

// simple help handler
function helpCommandHandler(message) {
	const embed = new RichEmbed();
	embed.setTitle('Commands:');
	embed.addField('ping', 'returns pong.. good for testing if the bot is dead.');
	embed.addField('leaderboard/standing', 'returns the current standing. Able to sort on different things.');
	embed.addField('map', 'Shows you the current map. Able to scroll through the different turns.');
	embed.addField(`subscribe', 'Allows you to subscribe to a player. 
    You will be notified every hour if you need to make a move.`);
	embed.addField('unsubscribe', 'Removes you from the subscription of a player.');

	message.reply(embed);
}

client.on('ready', () => {
	console.log('Connected');

	mapHandler = require('./commands/map').init(RichEmbed, database, config);
	scheduler = require('./commands/scheduler').init(database, client, config, mapHandler, RichEmbed);

	console.log('loading complete');
});

// reacting on certain commands
client.on('message', (message) => {
	if (message.channel.name === 'diplomacy') {
		if (message.isMentioned(client.user.id)) {
			let args = message.content.split(' ');
			const cmd = args[1];
			args = args.slice(2, args.length);

			switch (cmd) {
				case 'ping':
					message.reply('pong');
					break;
				case 'leaderboard':
				case 'standing':
					leadboardHandler.commandHandler(message);
					break;
				case 'map':
					mapHandler.commandHandler(message);
					break;
				case 'subscribe':
				case 'unsubscribe':
					scheduler.subParser(message);
					break;
				case 'addGame':
					// if (message.channel.guild.id === config.DebugServer) {
					if (args.length === 3 && !isNaN(args[0]) && !isNaN(args[1]) && isNaN(args[3])) {
						scheduler.addGame(args[0], args[1], args[2]);
					}
					// }
					break;
				case 'help':
				default:
					helpCommandHandler(message);
					break;
			}
		}
	}
});

main();
