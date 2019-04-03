﻿const request = require('request');
const parser = require('cheerio-tableparser');
const fs = require('fs');
const cheerio = require('cheerio');

let database;

let subscriptionHandler;

const site = "https://webdiplomacy.net/";
let siteContent;

let client;
let config;

let mapHandler;
let leaderboardHanlder;

module.exports = {
    init(d, c, co, m, l, rich) {
        database = d;
        mapHandler = m;
        client = c;
        config = co;
        leaderboardHanlder = l;

        subscriptionHandler = require('./subscription').init(null, database, rich);

        //interval timer
        this.stateCheck();
        setInterval(function () { module.exports.stateCheck(); }, 600 * 1000);
        setInterval(function () {
            database.getGames(function (games) {
                games.forEach(g => {
                    if (g.phase !== "Finished") {
                        module.exports.httpGet(g.GameID, function (response) {
                            siteContent = response;

                            subscriptionHandler.setSiteContent(siteContent);

                            subscriptionHandler.notReady(client, g.GameID);
                        });
                    }
                });
            });


        }, config.IntervalTimeInSeconds * 1000);
        return this;
    },

    stateCheck: function () {
        database.getGames(function (games) {
            games.forEach(g => {
                if (g.phase !== "Finished") {
                    module.exports.httpGet(g.GameID, function (response) {
                        siteContent = response;

                        subscriptionHandler.setSiteContent(siteContent);

                        let $ = cheerio.load(siteContent);
                        parser($);

                        let date = $('span.gameDate').text();
                        let phase = $('span.gamePhase').text();

                        if (phase === "Finished") {
                            database.updateGamePhase(g.GameID, phase);
                        }

                        //checking if the data is current
                        if (g.date !== date) {
                            database.updateGameDate(g.GameID, date);

                            //announcing the new date and sending a new map to the channel
                            if (!config.Debug) {
                                client.channels.forEach(c => {
                                    if (c.name === "diplomacy") {
                                        database.getGame(g.GameID, function (game) {
                                            c.send(`Date is now ${date} for game ${game.GameID}`)
                                                .then(message => mapHandler.mapUpdate(message, game));
                                        });
                                    }
                                });
                            }

                            let members = $('.membersFullTable').parsetable(false, false, true);
                            for (var i = 0; i < members[0].length; i++) {
                                //some weird data is undefined
                                if (members[1][i * 2] === undefined) {
                                    break;
                                }
                                if (members[1][i * 2].includes("Defeated")) {
                                    continue;
                                }

                                //getting the player data
                                let country = members[0][i * 2];
                                let data = members[1][i * 2].split(",");
                                let name = data[0].split("(")[0].trim();
                                if (name === "") {
                                    name = data[0].split("(")[1].split(")")[0].trim();//filtering out anonymous names
                                }

                                let supply_centers = data[1].split(" ")[3];
                                let units = data[2].split(" ")[1];

                                database.playerExists(name);

                                //checking if the data needs to be updated
                                if (name === "Anonymous") {
                                    database.getGameDataCountry(g.GameID, country, function (Gdata) {
                                        if (Gdata === undefined) {
                                            database.addGameData(g.GameID, name, supply_centers, units, country);
                                        } else if (Gdata.supply_centers !== supply_centers || Gdata.units !== units) {
                                            database.updateGameData(g.GameID, name,country, supply_centers, units);
                                        }
                                    });
                                } else {
                                    database.getGameDataPlayer(g.GameID, name, function (Gdata) {
                                        if (Gdata === undefined) {
                                            database.addGameData(g.GameID, name, supply_centers, units, country);
                                        } else if (Gdata.supply_centers !== supply_centers || Gdata.units !== units) {
                                            database.updateGameData(g.GameID, name,country, supply_centers, units);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });
    },

    httpGet: function (id, callback) {
        request(`${site}board.php?gameID=${id}`, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                callback(body);
            }
        });

    },


    subParser: function (message) {
        subscriptionHandler.CommandHandler(message);
    },

    addGame: function (id, startYear, startSeason) {

        this.httpGet(id, function (body) {
            const $ = cheerio.load(body);
            if ($('span.gamePotType').text().includes("Anonymous")) {
                database.addGame(id, startYear, startSeason, startSeason + ", " + startYear, "starting", "Anonymous");
            } else {
                database.addGame(id, startYear, startSeason, startSeason + ", " + startYear, "starting", "Open");
            }
            module.exports.stateCheck();
        });

    }
};