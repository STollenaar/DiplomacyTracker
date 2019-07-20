/* eslint-disable no-loop-func */
'use strict';

const request = require('request');
const parser = require('cheerio-tableparser');
const cheerio = require('cheerio');

let database;

let subscriptionHandler;

let site;
let client;
let config;

let mapHandler;

module.exports = {
	init(d, c, co, m, rich) {
		database = d;
		mapHandler = m;
		client = c;
		config = co;
		site = config.Site;

		subscriptionHandler = require('./subscription').init(null, database, rich);

		// interval timer
		this.stateCheck();
		setInterval(() => { module.exports.stateCheck(); }, 600 * 1000);
		setInterval(async () => {
			const games = await database.getGames();
			games.forEach(async (g) => {
				if (g.phase !== 'Finished') {
					const siteContent = await module.exports.httpGet(g.GameID);

					subscriptionHandler.setSiteContent(siteContent);

					subscriptionHandler.notReady(client, g.GameID);
				}
			});
		}, config.IntervalTimeInSeconds * 1000);
		return this;
	},

	async stateCheck() {
		const games = await database.getGames();
		games.forEach(async (g) => {
			if (g.phase !== 'Finished') {
				const siteContent = await module.exports.httpGet(g.GameID);
				subscriptionHandler.setSiteContent(siteContent);

				const $ = cheerio.load(siteContent);
				parser($);

				const date = $('span.gameDate').text();
				const phase = $('span.gamePhase').text();

				if (phase === 'Finished') {
					database.updateGamePhase(g.GameID, phase);
				}

				// checking if the data is current
				if (g.date !== date) {
					database.updateGameDate(g.GameID, date);

					// announcing the new date and sending a new map to the channel
					if (!config.Debug) {
						client.channels.forEach(async (c) => {
							if (c.name === 'diplomacy') {
								const game = await database.getGame(g.GameID);
								const message = await c.send(`Date is now ${date} for game ${game.GameID}`);
								mapHandler.mapUpdate(message, game);
							}
						});
					}

					const members = $('.membersFullTable').parsetable(false, false, true);
					for (let i = 0; i < members[0].length; i++) {
						// some weird data is undefined
						if (members[1][i * 2] === undefined) {
							break;
						}
						if (members[1][i * 2].includes('Defeated')) {
							continue;
						}

						// getting the player data
						const country = members[0][i * 2];
						const data = members[1][i * 2].split(',');
						let name = data[0].split('(')[0].trim();
						if (name === '') {
							name = data[0].split('(')[1].split(')')[0].trim();// filtering out anonymous names
						}

						const supplyCenters = data[1].split(' ')[3];
						const units = data[2].split(' ')[1];

						database.playerExists(name);

						// checking if the data needs to be updated
						let Gdata;
						if (name === 'Anonymous') {
							Gdata = await database.getGameDataCountry(g.GameID, country);
						}
						else {
							Gdata = await database.getGameDataPlayer(g.GameID, name);
						}

						if (Gdata === undefined) {
							database.addGameData(g.GameID, name, supplyCenters, units, country);
						}
						else if (Gdata.supplyCenters !== supplyCenters || Gdata.units !== units) {
							database.updateGameData(g.GameID, name, country, supplyCenters, units);
						}
					}
				}
			}
		});
	},

	httpGet(id) {
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

	subParser(message) {
		subscriptionHandler.commandHandler(message);
	},

	async addGame(id, startYear, startSeason) {
		const body = await this.httpGet(id);
		const $ = cheerio.load(body);
		if ($('span.gamePotType').text().includes('Anonymous')) {
			database.addGame(id, startYear, startSeason, `${startSeason}, ${startYear}`, 'starting', 'Anonymous');
		}
		else {
			database.addGame(id, startYear, startSeason, `${startSeason}, ${startYear}`, 'starting', 'Open');
		}
		this.stateCheck();
	},
};
