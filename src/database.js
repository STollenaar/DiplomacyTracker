'use strict';

const mysql = require('mysql');

const db = mysql.createPool({
	host: 'localhost',
	user: 'diplomacy',
	password: 'diplomacy',
	database: 'DIPLOMACY_DB',
});

module.exports = {

	// add a new playername to the db
	addPlayer(player) {
		db.getConnection((_error, connection) => {
			connection.query(`INSERT INTO player (PlayerName) VALUES ('${player}');`);
			connection.release();
		});
	},

	// checking if player exists if not adding to db
	playerExists(player) {
		db.getConnection((_error, connection) => {
			connection.query(`SELECT PlayerName FROM player WHERE PlayerName = '${player}';`, (_err, row) => {
				if (row.length === 0) {
					module.exports.addPlayer(player);
				}
			});
			connection.release();
		});
	},

	// debug purpose
	playerNameDump() {
		db.getConnection((_error, connection) => {
			connection.query('SELECT * FROM player;', (_err, row) => {
				row.forEach((r) => console.log(r.PlayerName));
			});
			connection.release();
		});
	},

	getPlayerNameFromData(gameID, country) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT Player_PlayerName FROM gamedata WHERE Game_GameID=${gameID} 
			AND country='${country}';`, (_err, row) => resolve(row));

				connection.release();
			});
		});
	},

	// adds a new game to the db
	addGame(id, startYear, startSeason, date, phase, type) {
		db.getConnection((_error, connection) => {
			connection.query(`INSERT INTO game (GameID, startYear, startSeason, date, phase, type) 
			VALUES (${id}, ${startYear}, '${startSeason}', '${date}', '${phase}', '${type}');`);
			connection.release();
		});
	},

	updateGamePhase(id, phase) {
		db.getConnection((_error, connection) => {
			connection.query(`UPDATE game SET phase='${phase}' WHERE GameID=${id};`);
			connection.release();
		});
	},

	// queryting query the games currently in the db
	getGames() {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query('SELECT * FROM game;', (_err, rows) => {
					resolve(rows);
				});
				connection.release();
			});
		});
	},

	// query a specific game
	getGame(id) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT * FROM game WHERE GameID=${id};`, (_err, row) => resolve(row[0]));
				connection.release();
			});
		});
	},

	// updating the game date
	updateGameDate(id, date) {
		db.getConnection((_error, connection) => {
			connection.query(`UPDATE game SET date='${date}' WHERE GameID = ${id};`);
			connection.release();
		});
	},

	// adding new gamedata to the db
	addGameData(gameID, player, supply, units, country) {
		db.getConnection((_error, connection) => {
			connection.query(`INSERT INTO gamedata (Game_GameID, Player_PlayerName, supply_centers, units, country) 
			VALUES (${gameID}, '${player}', ${supply}, ${units}, '${country}');`);
			connection.release();
		});
	},

	// queryting specific gamedata
	getGameDataPlayer(gameID, player) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} 
				AND Player_PlayerName='${player}';`,
			 (_err, row) => resolve(row[0]));
			 connection.release();
			});
		});
	},

	getGameDataCountry(gameID, country) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND country='${country}';`,
					(_err, row) => resolve(row[0]));
				connection.release();
			});
		});
	},

	// queryting query the gamedata
	getAllGameData(gameID) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT d.*, g.date FROM gamedata d INNER JOIN game g 
			WHERE Game_GameID =${gameID} AND GameID=${gameID};`, (_err, row) => resolve(row));
				connection.release();
			});
		});
	},

	// updating gamedata
	updateGameData(gameID, player, country, supply, unit) {
		db.getConnection((_error, connection) => {
			connection.query(`UPDATE gamedata SET supply_centers=${supply},
			 units=${unit} WHERE Game_GameID = ${gameID} AND 
			Player_PlayerName='${player}' AND 'country'='${country}';`);
			connection.release();
		});
	},

	// adding a subscription
	addSubscription(gameID, player, guild, user) {
		db.getConnection((_error, connection) => {
			connection.query(`INSERT INTO subscription (Game_GameID, Player_PlayerName, guildId, userId) 
			VALUES (${gameID}, '${player}', '${guild}', '${user}');`);
			connection.release();
		});
	},

	// removing a subscription
	removeSubscription(gameID, player, userID) {
		db.getConnection((_error, connection) => {
			connection.query(`DELETE FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`);
			connection.release();
		});
	},

	// queryting a specific subscription
	getSubscriptionUser(gameID, player, userID) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`, (_err, row) => resolve(row[0]));
				connection.release();
			});
		});
	},

	// querys query the subscriptions of that game
	getSubscriptions(gameID, player) {
		return new Promise((resolve) => {
			db.getConnection((_error, connection) => {
				connection.query(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}';`, (_err, row) => resolve(row[0]));
				connection.release();
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
				Site: 'http://localhost/',
			};
			const json = JSON.stringify(object, null, 4);
			fs.writeFile(__dirname.concat('/config.json'), json, 'utf8', () => resolve());
		});
	},
};
