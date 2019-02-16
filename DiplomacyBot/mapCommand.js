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

    setGame: function (g) {
        game = g;
    },

    CommandHandler: function (message) {
        let embed = new RichEmbed();
        const filter = (reaction, user) => {
            return ['◀', '▶', '⏮', '⏭'].includes(reaction.emoji.name) && user.id === message.author.id;
        };



        embed.setImage(this.getMapSrc(-2));
        embed.setTitle(`Map as of ${game.Date.replace('-', ' ')}`);

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
                        if (mapIndex < this.getLatestMapIndex(-2)) {
                            mapIndex++;
                        } else {
                            return;
                        }
                        break;
                    case '⏭':
                        mapIndex = this.getLatestMapIndex(-2);
                        break;
                    case '⏮':
                        mapIndex = -1;
                        break;
                }

                //completing edit
                editEmbed.setTitle(this.indexToDate());
                editEmbed.setImage(this.getMapSrc(mapIndex));
                embedMessage.edit(editEmbed);
            });
        });
    },


    mapUpdate: function (message) {
        let embed = new RichEmbed();

        embed.setImage(this.getMapSrc(-2));
        embed.setTitle(message.content);
        message.edit(embed)
    },

    getMapSrc: function (index) {
        mapIndex = this.getLatestMapIndex(index);
        return `${ site }map.php?gameID=${game.GameID}&turn=${mapIndex}`;
    },

    indexToDate: function () {
        let diff = Math.abs(mapIndex - this.getLatestMapIndex(-2));

        let [season, year]= game.Date.split("-");

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

        let [season, year] = game.Date.split("-");
        return (year - game.startYear) * 2 + (season === game.startSeason ? 0 : 1);//returning the correct map index
    }

};
