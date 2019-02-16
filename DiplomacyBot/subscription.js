const parser = require('cheerio-tableparser');
const cheerio = require('cheerio');

let sitecontent;
let players = [];
let game;


module.exports = {

    subscribers: new Map(),

    init(s, g) {
        sitecontent = s;
        game = g;
        console.log(game.Subscriptions);

      //  this.subscribers = new Map(game.Subscriptions);

        for (let player in game.Leaderboard) {
            player = game.Leaderboard[player];
            players.push(player.name.toLowerCase());
        }
        return this;
    },
    getGame: function () {
        return game;
    },

    setGame: function (g) {
        game = g;
    },

    setSiteContent: function (content) {
        sitecontent = content;
    },


    CommandHandler: function (message) {

        let args = message.content.split(" ");
        let cmd = args[1];
        args = args.slice(2, args.length);

        //checking if it is valid
        if (args.length === 0 || !players.includes(args[0].toLowerCase())) {
            message.reply("Invalid command, please ensure you have added the player to subscribe to");
            return;
        }

        if (cmd === 'subscribe') {
            //checking if a new entry has to be made
            if (this.subscribers.get(args[0].toLowerCase()) === undefined) {
                this.subscribers.set(args[0].toLowerCase(), []);
            }
            let person = {"id": message.author.id.toString(), "channel": message.channel.id.toString() };
            //adding user to the list
            this.subscribers.get(args[0].toLowerCase()).push(person);
            message.reply(`You have now been subscribed to ${args[0]}`);
            game.Subscriptions = this.subscribers;
        } else {
            //checking if the entry is valid
            if (this.subscribers.get(args[0].toLowerCase()) !== undefined) {
                if (!this.subscribers.get(args[0].toLowerCase()).find(x => x.id === message.author.id) === undefined) {
                    message.reply("You have not been subscribed to this person");
                    return;
                }

                //removing user from the list
                let subs = this.subscribers.get(args[0].toLowerCase());
                console.log(subs);
                subs = subs.splice(subs.findIndex(x => x.id === message.author.id), 1);
                console.log(subs);
                this.subscribers.set(args[0].toLowerCase(), subs);
                message.reply(`You have been unsubscribed from ${args[0]}`);
                game.Subscriptions = this.subscribers;
            }
        }

    },

    notReady: function(channel) {
        const $ = cheerio.load(sitecontent);
        parser($);
        let countries = $('.membersFullTable').parsetable(false, false, false)[0];
        for (let line in countries) {
            line = countries[line];
            if (line.includes('alert.png') || line.includes('tick.png')) {
                let country = line.split(">")[5].split("<")[0];
                for (let player in game.Leaderboard) {
                    player = game.Leaderboard[player];
                    //getting the country of the players who are not ready
                    if (player.country === country) {
                        //finding the list of subscribers
                        if (this.subscribers.get(player.name.toLowerCase()) !== undefined) {
                            //notifying subscribers
                            for (let sub in this.subscribers.get(player.name.toLowerCase())) {
                                sub = this.subscribers.get(player.name.toLowerCase())[sub];
                                channel.find(x => x.id === sub.channel).send(`<@${sub.id}> from your subscription of ${player.name} your move have not been set to ready yet.`);
                            }
                        }

                        break;
                    }
                }
            }
        }

    }

};