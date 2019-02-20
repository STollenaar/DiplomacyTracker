let sqlite = require('sqlite3').verbose();

let db = new sqlite.Database('./diplomacy_db.db');

module.exports = {

    //add a new playername to the db
    addPlayer(player) {

        db.serialize(function () {
            db.run(`INSERT INTO player ('PlayerName') VALUES ('${player}');`);
        });
    },

    //checking if player exists if not adding to db
    playerExists(player) {
        db.get(`SELECT PlayerName FROM player WHERE PlayerName = '${player}';`, (err, row) => {
            if (row === undefined) {
                this.addPlayer(player);
            }
        });
    },

    //debug purpose
    playerNameDump() {
        db.all('SELECT * FROM player;', (err, row) => {
            row.forEach(r => console.log(r.PlayerName));
        });
    },

    getPlayerNameFromData(gameID, country, callback) {
        db.get(`SELECT Player_PlayerName FROM gamedata WHERE Game_GameID=${gameID} AND country='${country}';`, (err, row) => callback(row));
    },

    //adds a new game to the db
    addGame(id, startYear, startSeason, date) {
        db.serialize(function () {
            db.run(`INSERT INTO game ('GameID', 'startYear', 'startSeason', 'date') VALUES (${id}, ${startYear}, '${startSeason}', '${date}');`);
        });
    },

    //getting all the games currently in the db
    getGames(callback) {
        db.all('SELECT * FROM game;', (err, rows) => {
            callback(rows);
        });
    },

    //get a specific game
    getGame(id, callback) {
        db.serialize(function () {
            db.get(`SELECT * FROM game WHERE GameID=${id};`, (err, row) => callback(row));
        });
    },

    //updating the game date
    updateGame(id, date, callback) {
        db.serialize(function () {
            db.run(`UPDATE game SET 'date'='${date}' WHERE GameID = ${id}`);
        });
    },

    //adding new gamedata to the db
    addGameData(gameID, player, supply, units, country) {
        db.serialize(function () {
            db.run(`INSERT INTO gamedata ('Game_GameID', 'Player_PlayerName', 'supply_centers', 'units', 'country') VALUES (${gameID}, '${player}', ${supply}, ${units}, '${country}');`);
        });
    },

    //getting specific gamedata
    getGameData(gameID, player, callback) {
        db.get(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND Player_PlayerName='${player}';`, (err, row) => callback(row));
    },

    //getting all the gamedata
    getAllGameData(gameID, callback) {
        db.all(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID};`, (err, row) => callback(row));
    },

    //updating gamedata
    updateGameData(gameID, player, supply, unit) {
        db.serialize(function () {
            db.run(`UPDATE gamedata SET 'supply_centers'=${supply}, 'units'=${unit} WHERE Game_GameID = ${gameID} AND Player_PlayerName='${player}';`);
        });
    },

    //adding a subscription
    addSubscription(gameID, player, guild, user) {
        db.serialize(function () {
            db.run(`INSERT INTO subscription ('Game_GameID', 'Player_PlayerName', 'guildId', 'userId') VALUES (${gameID}, '${player}', '${guild}', '${user}');`);
        });
    },

    //removing a subscription
    removeSubscription(gameID, player, userID) {
        db.serialize(function () {
            db.run(`DELETE FROM subscription WHERE Game_GameID =${gameID} AND Player_PlayerName='${player}' AND userId='${userID}';`);
        });
    },

    //getting a specific subscription
    getSubscriptionUser(gameID, player, userID, callback) {
        db.get(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND Player_PlayerName='${player}' AND userId='${userID}';`, (err, row) => callback(row));
    },

    //gets all the subscriptions of that game
    getSubscriptions(gameID, player, callback) {
        db.all(`SELECT * FROM subscription WHERE Game_GameID =${gameID} AND Player_PlayerName='${player}';`, (err, row) => callback(row));
    }
};
