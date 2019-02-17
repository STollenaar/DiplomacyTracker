const request = require('request');
const parser = require('cheerio-tableparser');
const fs = require('fs');
const cheerio = require('cheerio');

let subscriptionHandler;

const site = "https://webdiplomacy.net/";
let siteContent;

let state;
let game;
let client;

let mapHandler;
let leaderboardHanlder;

module.exports = {
    init(s,c, m, l) {
        state = s;
        game = s.Games[0];
        mapHandler = m;
        client = c;
        leaderboardHanlder = l;

        subscriptionHandler = require('./subscription').init(null, game);

        //interval timer
        this.stateCheck();
        setInterval(function () { module.exports.stateCheck(); }, state.IntervalTimeInSeconds * 1000);
        return this;
    },

    stateCheck: function () {
        this.httpGet(function (response) {
            siteContent = response;

            subscriptionHandler.setSiteContent(siteContent);

            subscriptionHandler.notReady(client);
            const $ = cheerio.load(siteContent);
            parser($);

            //checking if the data is current
            if (game.Date.replace("-", ", ") !== $('span.gameDate').text()) {
                game.Date = $('span.gameDate').text().replace(", ", "-");

                //updating values
                mapHandler.setGame(game);
                leaderboardHanlder.setGame(game);

                //announcing the new date and sending a new map to the channel
                client.channels.forEach(c => {
                    if (c.name === "diplomacy") {
                        c.send(`Date is now ${game.Date.replace('-', ', ')}`)
                            .then(message => mapHandler.mapUpdate(message));
                    }
                });
                    

                let members = $('.membersFullTable').parsetable(false, false, true);

                for (var i = 0; i < members[0].length; i++) {
                    //some weird data is undefined
                    if (members[1][i * 2] === undefined) {
                        break;
                    }
                    //getting the player data
                    let country = members[0][i * 2];
                    let data = members[1][i * 2].split(",");
                    let name = data[0].split("(")[0].trim();
                    let supply_centers = data[1].split(" ")[3];
                    let units = data[2];

                    let found = false;

                    for (let p in game.Leaderboard) {
                        //updating player data
                        p = game.Leaderboard[p];
                        if (p.name === name) {
                            found = true;
                            if (p.supply_centers !== supply_centers) {
                                p.supply_centers = supply_centers;
                            }
                            if (p.units !== units) {
                                p.units = units;
                            }
                        }
                    }
                    if (!found) {
                        //adding new player data
                        let player = {
                            "name": name,
                            "country": country,
                            "supply_centers": supply_centers,
                            "units": units
                        };
                        game.Leaderboard.push(player);
                        subscriptionHandler.setGame(game);
                    }

                }
                module.exports.saveState();

            }

        });
    },

    httpGet: function (callback) {
        request(`${site}board.php?gameID=${game.GameID}`, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                callback(body);
            }
        });

    },


    subParser: function (message) {
        subscriptionHandler.CommandHandler(message);
    },

    saveState: function () {
        console.log("Saving state");

        game.Subscriptions = Array.from(subscriptionHandler.getGame().Subscriptions);
        //saving the new data
        state.Games[0] = game;

        fs.writeFile('state.json', JSON.stringify(state, null, 2), 'utf8', function (err) {
            if (err) throw err;
        });
    }

};