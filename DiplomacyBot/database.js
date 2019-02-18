let sqlite = require('sqlite3').verbose();

let db = new sqlite.Database('./diplomacy_db.db');

module.exports = {

    addPlayer(player) {
        
        db.serialize(function () {
            db.run(`INSERT INTO player ('PlayerName') VALUES ('${player}');`);
        });
    },

    playerExists(player) {
        db.get(`SELECT PlayerName FROM player WHERE PlayerName = '${player}';`, (err, row) => {
            if (row === undefined) {
                this.addPlayer(player);
            }
        });
    },

    playerNameDump() {
        db.all('SELECT * FROM player;', (err, row) => {
            row.forEach(r => console.log(r.PlayerName));
        });
    },

    addGame(id, startYear, startSeason, date) {
        db.serialize(function () {
            db.run(`INSERT INTO game ('GameID', 'startYear', 'startSeason', 'date') VALUES (${id}, ${startYear}, '${startSeason}', '${date}');`);
        });
    },

    getGames(callback) {
        db.all('SELECT * FROM game;', (err, rows) => {
            callback(rows);
        });
    },

    getGame(id, callback) {
        db.get(`SELECT * FROM game WHERE GameID=${id};`, (err, row) => callback(row));
    },

    updateGame(id, date) {
        db.serialize(function () {
            db.run(`UPDATE game SET 'date'='${date}' WHERE GameID = ${id}`);
        });
    },

    addGameData(gameID, player, supply, units, country) {
        db.serialize(function () {
            db.run(`INSERT INTO gamedata ('Game_GameID', 'Player_PlayerName', 'supply_centers', 'units', 'country') VALUES (${gameID}, '${player}', ${supply}, ${units}, '${country}');`);
        });
    },

    getGameData(gameID, player, callback) {
        db.get(`SELECT * FROM gamedata WHERE Game_GAMEID =${gameID} AND Player_PlayerName='${player}';`, (err, row) => callback(row));
    },

    updateGameData(gameID, player, supply, unit) {
        db.serialize(function () {
            db.run(`UPDATE gamedata SET 'supply_centers'=${supply}, 'units'=${unit} WHERE Game_GameID = ${gameID} AND Player_PlayerName='${player}';`);
        });
    }





};
