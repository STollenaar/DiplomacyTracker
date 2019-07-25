'use strict';

const cheerio = require('cheerio');
const request = require('request');
const GIFEncoder = require('gifencoder');
const pngFileStream = require('png-file-stream');
const fs = require('fs-extra');

let RichEmbed;
let database;
let site;

// handles stuff for the map
module.exports = {
	init(Rich, d, config) {
		RichEmbed = Rich;
		database = d;
		site = config.Site;

		return this;
	},

	async commandHandler(message) {
		let args = message.content.split(' ');
		args = args.slice(2, args.length);

		// eslint-disable-next-line no-negated-condition
		if (args.length !== 1) {
			const games = await database.getGames();
			const embed = new RichEmbed();
			embed.setDescription('Need to specify gameID.');

			games.forEach((g) => {
				embed.addField(`ID: ${g.GameID}`, `Current Date of this game: ${g.date}`);
			});
			message.reply(embed);
		}
		else {
			const body = await this.httpGetGame(args[0]);
			const $ = cheerio.load(body);
			const index = $('img[id="mapImage"]').attr('src').split('/')[4].split('-')[0];
			const maps = [];

			// eslint-disable-next-line no-negated-condition
			if (!await fs.exists('images')) {
				await fs.mkdir('images');
			}
			else {
				await fs.emptyDir('images');
			}

			for (let i = -1; i <= index; i++) {
				maps.push(this.getMapSrc(i, args[0]));
				request(this.getMapSrc(i, args[0])).pipe(fs.createWriteStream(`./images/${i + 1}.png`));
			}

			const encoder = new GIFEncoder(612, 398);
			const stream = pngFileStream('./images/*.png')
				.pipe(encoder.createWriteStream({repeat: 0, delay: 1000, quality: 20}))
				.pipe(fs.createWriteStream('img.gif'));

		  stream.on('finish', () => {
			// Process generated GIF
				const embed = new RichEmbed();
				embed.setTitle(`Progress of game ${args[0]}`);
				embed.attachFile('img.gif');
				embed.setImage('attachment://img.gif');
				message.reply(embed);
		  });
		}
	},

	httpGetGame(id) {
		return new Promise((resolve, reject) => {
			request(`${site}board.php?gameID=${id}`, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					resolve(body);
				}
				else {
					reject(error);
				}
			});
		});
	},

	getMapSrc(index, id) {
		return `${site}map.php?gameID=${id}&turn=${index}`;
	},
};
