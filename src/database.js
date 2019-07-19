'use strict';

// TODO switch to mysql

const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./diplomacy_db.db');

module.exports = {

	// add a new playername to the db
	addPlayer(player) {
		db.serialize(() => {
			db.run(`INSERT INTO player ('PlayerName') VALUES ('${player}');`);
		});
	},

	// checking if player exists if not adding to db
	playerExists(player) {
		db.serialize(() => {
			db.get(`SELECT PlayerName FROM player WHERE PlayerName = '${player}';`, (_err, row) => {
				if (row === undefined) {
					module.exports.addPlayer(player);
				}
			});
		});
	},

	// debug purpose
	playerNameDump() {
		db.serialize(() => {
			db.all('SELECT * FROM player;', (_err, row) => {
				row.forEach((r) => console.log(r.PlayerName));
			});
		});
	},

	getPlayerNameFromData(gameID, country) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.get(`SELECT Player_PlayerName FROM gamedata WHERE Game_GameID=${gameID} 
			AND country='${country}';`, (_err, row) => resolve(row));
			});
		});
	},

	// adds a new game to the db
	addGame(id, startYear, startSeason, date, phase, type) {
		db.serialize(() => {
			db.run(`INSERT INTO game ('GameID', 'startYear', 'startSeason', 'date', 'phase', 'type') 
			VALUES (${id}, ${startYear}, '${startSeason}', '${date}', '${phase}', '${type}');`);
		});
	},

	updateGamePhase(_id, phase) {
		db.serialize(() => {
			db.run(`UPDATE game SET 'phase'='${phase}';`);
		});
	},

	// getting all the games currently in the db
	getGames() {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.all('SELECT * FROM game;', (_err, rows) => {
					resolve(rows);
				});
			});
		});
	},

	// get a specific game
	getGame(id) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.get(`SELECT * FROM game WHERE GameID=${id};`, (_err, row) => resolve(row));
			});
		});
	},

	// updating the game date
	updateGameDate(id, date) {
		db.serialize(() => {
			db.run(`UPDATE game SET 'date'='${date}' WHERE GameID = ${id}`);
		});
	},

	// adding new gamedata to the db
	addGameData(gameID, player, supply, units, country) {
		db.serialize(() => {
			db.run(`INSERT INTO gamedata ('Game_GameID', 'Player_PlayerName', 'supply_centers', 'units', 'country') 
			VALUES (${gameID}, '${player}', ${supply}, ${units}, '${country}');`);
		});
	},

	// getting specific gamedata
	getGameDataPlayer(gameID, player) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.get(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND Player_PlayerName='${player}';`,
			 (_err, row) => resolve(row));
			});
		});
	},

	getGameDataCountry(gameID, country) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.get(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND country='${country}';`,
					(_err, row) => resolve(row));
			});
		});
	},

	// getting all the gamedata
	getAllGameData(gameID) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.all(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID};`, (_err, row) => resolve(row));
			});
		});
	},

	// updating gamedata
	updateGameData(gameID, player, country, supply, unit) {
		db.serialize(() => {
			db.run(`UPDATE gamedata SET 'supply_centers'=${supply}, 'units'=${unit} WHERE Game_GameID = ${gameID} AND 
			Player_PlayerName='${player}' AND 'country'='${country}';`);
		});
	},

	// adding a subscription
	addSubscription(gameID, player, guild, user) {
		db.serialize(() => {
			db.run(`INSERT INTO subscription ('Game_GameID', 'Player_PlayerName', 'guildId', 'userId') 
			VALUES (${gameID}, '${player}', '${guild}', '${user}');`);
		});
	},

	// removing a subscription
	removeSubscription(gameID, player, userID) {
		db.serialize(() => {
			db.run(`DELETE FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`);
		});
	},

	// getting a specific subscription
	getSubscriptionUser(gameID, player, userID) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.get(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`, (_err, row) => resolve(row));
			});
		});
	},

	// gets all the subscriptions of that game
	getSubscriptions(gameID, player) {
		return new Promise((resolve) => {
			db.serialize(() => {
				db.all(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}';`, (_err, row) => resolve(row));
			});
		});
	},

	defaultConfig(fs) {
		return new Promise((resolve) => {
			const object = {
				AuthTkn: 'AuthTkn',
				Debug: false,
				DebugServer: 'server',
				IntervalTimeInSeconds: 3600,
				Site: 'https://localhost/',
			};
			const json = JSON.stringify(object, null, 4);
			fs.writeFile('./config.json', json, 'utf8', () => resolve());
		});
	},
};
