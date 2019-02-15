const site = "https://webdiplomacy.net/";

let RichEmbed;
let game;
let mapIndex = 0;

//handles stuff for the map
module.exports = {
    init(Rich, g) {
        RichEmbed = Rich;
        game = g;

        return this;
    },


    CommandHandler: function (message) {
        let embed = new RichEmbed();
        const filter = (reaction, user) => {
            return ['◀', '▶', '⏮', '⏭'].includes(reaction.emoji.name) && user.id === message.author.id;
        };



        embed.setImage(module.exports.getMapSrc(-2));
        embed.setTitle(`Map as of ${game.Date.replace('-', ' ')}`);

        //scrolling through map timeline
        message.channel.send(embed).then(async embedMessage => {
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
                        if (mapIndex < module.exports.getLatestMapIndex(-2)) {
                            mapIndex++;
                        } else {
                            return;
                        }
                        break;
                    case '⏭':
                        mapIndex = module.exports.getLatestMapIndex(-2);
                        break;
                    case '⏮':
                        mapIndex = -1;
                        break;
                }

                //completing edit
                editEmbed.setTitle(module.exports.indexToDate());
                editEmbed.setImage(module.exports.getMapSrc(mapIndex));
                embedMessage.edit(editEmbed);
            });
        });
    },

    getMapSrc: function (index) {
        mapIndex = module.exports.getLatestMapIndex(index);
        return `${ site }map.php?gameID=${game.GameID}&turn=${mapIndex}`;
    },

    indexToDate: function () {
        let diff = Math.abs(mapIndex - module.exports.getLatestMapIndex(-2));

        let season = game.Date.split("-")[0];
        let year = game.Date.split("-")[1];

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
    getLatestMapIndex: function (index) {
        if (index !== -2) return index;

        let season = game.Date.split("-")[0];
        let year = game.Date.split("-")[1];

        return (year - game.startYear) * 2 + (season === game.startSeason ? 0 : 1);//returning the correct map index
    }

};
