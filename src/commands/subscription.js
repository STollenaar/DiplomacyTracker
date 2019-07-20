/* eslint-disable no-negated-condition */
'use strict';

const parser = require('cheerio-tableparser');
const cheerio = require('cheerio');
let RichEmbed;

let sitecontent;
let database;

module.exports = {

	init(s, d, rich) {
		sitecontent = s;
		database = d;
		RichEmbed = rich;

		return this;
	},

	setSiteContent(content) {
		sitecontent = content;
	},

	async commandHandler(message) {
		let args = message.content.split(' ');
		const cmd = args[1];
		args = args.slice(2, args.length);

		if (args.length !== 2) {
			const games = await database.getGames();
			const embed = new RichEmbed();
			embed.setDescription('Need to specify gameID.');
			games.forEach((g) => {
				embed.addField(`ID: ${g.GameID}`, `Current Date of this game: ${g.date}`);
			});
			message.reply(embed);
		}
		else {
			let game = await database.getGame(args[0]);
			// preventing anonymous game subscriptions
			if (game.type === 'Anonymous') {
				message.reply("Subscriptions aren't possible in Anonymous games.");
			}
			else {
				game = await database.getGameDataPlayer(args[0], args[1]);
				if (game === undefined) {
					message.reply('Invalid GameID or playername');
				}
				else if (cmd === 'subscribe') {
					// subbing
					const sub = await database.getSubscriptionUser(args[0], args[1], message.author.id);
					// checking if the entry is valid
					if (sub === undefined) {
						database.addSubscription(args[0], args[1], message.guild.id, message.author.id);
						message.reply(`You have now been subscribed to ${args[1]} for game ${args[0]}`);
					}
					else {
						message.reply(`You are already subscribed to ${args[1]} for game ${args[0]}`);
					}
				}
				else {
					const sub = await database.getSubscriptionUser(args[0], args[1], message.author.id);
					// checking if the entry is valid
					if (sub === undefined) {
						message.reply('You have not been subscribed to this person');
					}
					else {
						// unsubbing
						database.removeSubscription(args[0], args[1], message.author.id);
						message.reply(`You have been unsubscribed from game 
									${args[0]} and player ${args[1]}`);
					}
				}
			}
		}
	},

	async notReady(client, gameID) {
		const $ = cheerio.load(sitecontent);
		parser($);
		const countries = $('.membersFullTable').parsetable(false, false, false)[0];
		// looping through countries
		for (let line in countries) {
			line = countries[line];
			if (line.includes('alert.png') || line.includes('tick_faded.png')) {
				const country = line.split('>')[5].split('<')[0];
				// getting the player from country and gameID
				const player = await database.getPlayerNameFromData(gameID, country);
				if (player !== undefined) {
					// getting the subs for that player
					const subs = await database.getSubscriptions(gameID, player.Player_PlayerName);
					if (subs !== []) {
						subs.forEach((sub) => {
							client.channels.forEach((c) => {
								if (c.name === 'diplomacy' && c.guild.id === sub.guildId.toString()) {
									c.send(`<@${sub.userId}> from your subscription of 
											${player.Player_PlayerName} in game ${gameID} your move have 
											not been set to ready yet.`);
								}
							});
						});
					}
				}
			}
		}
	},

};
