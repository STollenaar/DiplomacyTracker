const site = "https://webdiplomacy.net/";

let RichEmbed;
let database;

let mapIndex = 0;

//handles stuff for the map
module.exports = {
    init(Rich, d) {
        RichEmbed = Rich;
        database = d;

        return this;
    },

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
            database.getGame(args[2], function (game) {
                if (game === undefined) {
                    message.reply("Invalid GameID");
                } else {

                    let embed = new RichEmbed();
                    const filter = (reaction, user) => {
                        return ['◀', '▶', '⏮', '⏭'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };



                    embed.setImage(module.exports.getMapSrc(-2, game));
                    embed.setTitle(`Map as of ${game.date}`);

                    //scrolling through map timeline
                    message.reply(embed).then(async embedMessage => {
                        await embedMessage.react('⏮');
                        await embedMessage.react('◀');
                        await embedMessage.react('▶');
                        await embedMessage.react('⏭');

                        let collector = embedMessage.createReactionCollector(filter, { time: 180000 });

                        collector.on('collect', (reaction, reactionCollector) => {
                            const editEmbed = new RichEmbed();

                            //scrolling correctly
                            switch (reaction.emoji.name) {
                                case '◀':
                                    if (mapIndex > -1) {
                                        mapIndex--;
                                    } else {
                                        return;
                                    }
                                    break;
                                case '▶':
                                    if (mapIndex < module.exports.getLatestMapIndex(-2, game)) {
                                        mapIndex++;
                                    } else {
                                        return;
                                    }
                                    break;
                                case '⏭':
                                    mapIndex = module.exports.getLatestMapIndex(-2, game);
                                    break;
                                case '⏮':
                                    mapIndex = -1;
                                    break;
                            }

                            //completing edit
                            editEmbed.setTitle(module.exports.indexToDate(game));
                            editEmbed.setImage(module.exports.getMapSrc(mapIndex, game));
                            embedMessage.edit(editEmbed);
                        });
                    });
                }
            });
        }
    },


    mapUpdate: function (message, game) {
        let embed = new RichEmbed();

        embed.setImage(this.getMapSrc(-2, game));
        embed.setTitle(message.content);
        message.edit(embed);
    },

    getMapSrc: function (index,game) {
        mapIndex = this.getLatestMapIndex(index, game);
        return `${ site }map.php?gameID=${game.GameID}&turn=${mapIndex}`;
    },

    indexToDate: function (game) {
        let diff = Math.abs(mapIndex - this.getLatestMapIndex(-2, game));

        let [season, year]= game.date.split(", ");

        //switching the season correctly
        if (!(diff % 2 === 0)) {
            if (season === "Spring") {
                season = "Autum";
            } else {
                season = "Spring";
            }
        }
        //setting the year correctly
        year -= Math.ceil(diff / 2);
        return season + " " + year;
    },

    //gets a correct map index
    getLatestMapIndex: function (index, game) {
        if (index !== -2) return index;

        let [season, year] = game.date.split(", ");
        return (year - game.startYear) * 2 + (season === game.startSeason ? 0 : 1);//returning the correct map index
    }

};
