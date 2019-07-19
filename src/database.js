'use strict';

const mysql = require('mysql');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'diplomacy',
	password: 'diplomacy',
	database: 'DIPLOMACY_DB',
});

db.connect();

module.exports = {

	// add a new playername to the db
	addPlayer(player) {
		db.query(`INSERT INTO player (PlayerName) VALUES ('${player}');`);
	},

	// checking if player exists if not adding to db
	playerExists(player) {
		db.query(`SELECT PlayerName FROM player WHERE PlayerName = '${player}';`, (_err, row) => {
			if (row === undefined) {
				module.exports.addPlayer(player);
			}
		});
	},

	// debug purpose
	playerNameDump() {
		db.query('SELECT * FROM player;', (_err, row) => {
			row.forEach((r) => console.log(r.PlayerName));
		});
	},

	getPlayerNameFromData(gameID, country) {
		return new Promise((resolve) => {
			db.query(`SELECT Player_PlayerName FROM gamedata WHERE Game_GameID=${gameID} 
			AND country='${country}';`, (_err, row) => resolve(row));
		});
	},

	// adds a new game to the db
	addGame(id, startYear, startSeason, date, phase, type) {
		db.query(`INSERT INTO game (GameID, startYear, startSeason, date, phase, type) 
			VALUES (${id}, ${startYear}, '${startSeason}', '${date}', '${phase}', '${type}');`);
	},

	updateGamePhase(_id, phase) {
		db.query(`UPDATE game SET phase='${phase}';`);
	},

	// queryting query the games currently in the db
	getGames() {
		return new Promise((resolve) => {
			db.query('SELECT * FROM game;', (_err, rows) => {
				resolve(rows);
			});
		});
	},

	// query a specific game
	getGame(id) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM game WHERE GameID=${id};`, (_err, row) => resolve(row[0]));
		});
	},

	// updating the game date
	updateGameDate(id, date) {
		db.query(`UPDATE game SET date='${date}' WHERE GameID = ${id};`);
	},

	// adding new gamedata to the db
	addGameData(gameID, player, supply, units, country) {
		db.query(`INSERT INTO gamedata (Game_GameID, Player_PlayerName, supply_centers, units, country) 
			VALUES (${gameID}, '${player}', ${supply}, ${units}, '${country}');`);
	},

	// queryting specific gamedata
	getGameDataPlayer(gameID, player) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND Player_PlayerName='${player}';`,
			 (_err, row) => resolve(row[0]));
		});
	},

	getGameDataCountry(gameID, country) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND country='${country}';`,
				(_err, row) => resolve(row[0]));
		});
	},

	// queryting query the gamedata
	getGameData(gameID) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID};`, (_err, row) => resolve(row[0]));
		});
	},

	// updating gamedata
	updateGameData(gameID, player, country, supply, unit) {
		db.query(`UPDATE gamedata SET supply_centers=${supply}, units=${unit} WHERE Game_GameID = ${gameID} AND 
			Player_PlayerName='${player}' AND 'country'='${country}';`);
	},

	// adding a subscription
	addSubscription(gameID, player, guild, user) {
		db.query(`INSERT INTO subscription (Game_GameID, Player_PlayerName, guildId, userId) 
			VALUES (${gameID}, '${player}', '${guild}', '${user}');`);
	},

	// removing a subscription
	removeSubscription(gameID, player, userID) {
		db.query(`DELETE FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`);
	},

	// queryting a specific subscription
	getSubscriptionUser(gameID, player, userID) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}' AND userId='${userID}';`, (_err, row) => resolve(row[0]));
		});
	},

	// querys query the subscriptions of that game
	getSubscriptions(gameID, player) {
		return new Promise((resolve) => {
			db.query(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND 
			Player_PlayerName='${player}';`, (_err, row) => resolve(row[0]));
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
			fs.writeFile('./config.json', json, 'utf8', () => resolve());
		});
	},
};
