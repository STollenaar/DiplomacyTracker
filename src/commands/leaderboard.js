/* eslint-disable default-case */
/* eslint-disable no-negated-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
'use strict';

let database;
let RichEmbed;

const sortingFunctions = {
	'-1': () => { },
	0: (a, b) => {
		a = a.Player_PlayerName.toLowerCase();
		b = b.Player_PlayerName.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	},
	1: (a, b) => {
		return b.supply_centers - a.supply_centers;
	},
	2: (a, b) => {
		return b.units - a.units;
	},
	3: (a, b) => {
		a = a.country.toLowerCase();
		b = b.country.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	},
};

module.exports = {

	init(rich, d) {
		RichEmbed = rich;
		database = d;
		return this;
	},

	// handles stuff for the leaderboard
	async commandHandler(message) {
		const args = message.content.split(' ');

		if (args.length !== 3) {
			const games = await database.getGames();
			const embed = new RichEmbed();
			embed.setDescription('Need to specify gameID.');
			games.forEach((g) => {
				embed.addField(`ID: ${g.GameID}`, `Current Date of this game: ${g.date}`);
			});
			message.reply(embed);
		}
		else {
			const game = await database.getAllGameData(args[2]);
			if (game === undefined) {
				message.reply('Invalid GameID');
			}
			else {
				const embed = new RichEmbed();
				const filter = (reaction, user) => {
					return ['🚗', '🏭', '🌎', '🔤', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
				};

				module.exports.leaderBoardbuilder(embed, -1, game);

				// scrolling through map timeline
				const embedMessage = await message.reply(embed);
				await embedMessage.react('🚗');
				await embedMessage.react('🏭');
				await embedMessage.react('🌎');
				await embedMessage.react('🔤');
				await embedMessage.react('❌');

				const collector = embedMessage.createReactionCollector(filter, {time: 180000});

				collector.on('collect', (reaction) => {
					const editEmbed = new RichEmbed();

					// sorting correctly
					switch (reaction.emoji.name) {
						case '🚗':
							module.exports.leaderBoardbuilder(editEmbed, 2, game);
							break;
						case '🏭':
							module.exports.leaderBoardbuilder(editEmbed, 1, game);
							break;
						case '🌎':
							module.exports.leaderBoardbuilder(editEmbed, 3, game);
							break;
						case '🔤':
							module.exports.leaderBoardbuilder(editEmbed, 0, game);
							break;
						case '❌':
							module.exports.leaderBoardbuilder(editEmbed, -1, game);
							break;
					}

					// completing edit
					editEmbed.setTitle(embed.title);
					embedMessage.edit(editEmbed);
				});
			}
		}
	},

	leaderBoardArrayMaker(sortType, game) {
		const array = [];
		const sorted = game.sort(sortingFunctions[String(sortType)]);// getting the sorted data
		for (let player in sorted) {
			player = game[player];
			const data = [];
			data.push(player.country, player.Player_PlayerName, player.supply_centers, player.units);// building data
			array.push(data);
		}
		return array;
	},

	leaderBoardbuilder(embed, sortType, game) {
		const array = this.leaderBoardArrayMaker(sortType, game);
		for (let player in array) {
			player = array[player];
			embed.addField(
				`Country: ${player[0]}, Played by: ${player[1]}`,
				`Supply-Centers: ${player[2]}, Units: ${player[3]}`
			);
		}
	},
};
