let database;
let RichEmbed;


const sortingFunctions = {
    '-1': () => { },
    '0': (a, b) => {
        a = a.Player_PlayerName.toLowerCase();
        b = b.Player_PlayerName.toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
    },
    '1': (a, b) => {
        return b.supply_centers - a.supply_centers;
    },
    '2': (a, b) => {
        return b.units - a.units;
    },
    '3': (a, b) => {
        a = a.country.toLowerCase();
        b = b.country.toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
    }
};


module.exports = {

    init(rich, d) {
        RichEmbed = rich;
        database = d;
        return this;
    },


    //handles stuff for the leaderboard
    CommandHandler: function (message) {
        let args = message.content.split(" ");
        let cmd = args[1];

        if (args.length !== 3) {
            database.getGames(function (games) {
                let embed = new RichEmbed();
                embed.setDescription("Need to specify gameID.");
                games.forEach(g => {
                    embed.addField(`ID: ${g.GameID}`, `Current Date of this game: ${g.date}`);
                });
                message.reply(embed);
            });
        } else {
            database.getAllGameData(args[2], function (game) {
                if (game === undefined) {
                    message.reply("Invalid GameID");
                } else {
                    let embed = new RichEmbed();
                    const filter = (reaction, user) => {
                        return ['🚗', '🏭', '🌎', '🔤', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };

                    module.exports.leaderBoardbuilder(embed, -1, game);

                    //scrolling through map timeline
                    message.reply(embed).then(async embedMessage => {
                        await embedMessage.react('🚗');
                        await embedMessage.react('🏭');
                        await embedMessage.react('🌎');
                        await embedMessage.react('🔤');
                        await embedMessage.react('❌');

                        let collector = embedMessage.createReactionCollector(filter, { time: 180000 });

                        collector.on('collect', (reaction, reactionCollector) => {
                            let editEmbed = new RichEmbed();

                            //sorting correctly
                            switch (reaction.emoji.name) {
                                case '🚗':
                                    module.exports.leaderBoardbuilder(editEmbed, 2, game);
                                    break;
                                case '🏭':
                                    module.exports.leaderBoardbuilder(editEmbed, 1, game);
                                    break;
                                case '🌎':
                                    module.exports.leaderBoardbuilder(editEmbed, 3, game);
                                    break;
                                case '🔤':
                                    module.exports.leaderBoardbuilder(editEmbed, 0, game);
                                    break;
                                case '❌':
                                    module.exports.leaderBoardbuilder(editEmbed, -1, game);
                                    break;
                            }

                            //completing edit
                            editEmbed.setTitle(embed.title);
                            embedMessage.edit(editEmbed);
                        });
                    });
                }
            });
        }
    },

    leaderBoardArrayMaker: function (sortType, game) {
        let array = [];
        const sorted = game.sort(sortingFunctions[String(sortType)]);//getting the sorted data
        for (let player in sorted) {
            player = game[player];
            let data = [];
            data.push(player.country, player.Player_PlayerName, player.supply_centers, player.units);//building data
            array.push(data);
        }
        return array;
    },

    leaderBoardbuilder: function (embed, sortType, game) {
        let array = this.leaderBoardArrayMaker(sortType, game);
        for (let player in array) {
            player = array[player];
            embed.addField(
                `Country: ${player[0]}, Played by: ${player[1]}`,
                `Supply-Centers: ${player[2]}, Units: ${player[3]}`
            );
        }
    }
};