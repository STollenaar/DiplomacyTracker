let game;
let RichEmbed;


const sortingFunctions = {
    '-1': () => { },
    '0': (a, b) => {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
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

    init(rich, g) {
        RichEmbed = rich;
        game = g;
        return this;
    },

    //handles stuff for the leaderboard
    CommandHandler: function (message) {
        let embed = new RichEmbed();
        const filter = (reaction, user) => {
            return ['🚗', '🏭', '🌎', '🔤', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        this.leaderBoardbuilder(embed, -1);

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
                        this.leaderBoardbuilder(editEmbed, 2);
                        break;
                    case '🏭':
                        this.leaderBoardbuilder(editEmbed, 1);
                        break;
                    case '🌎':
                        this.leaderBoardbuilder(editEmbed, 3);
                        break;
                    case '🔤':
                        this.leaderBoardbuilder(editEmbed, 0);
                        break;
                    case '❌':
                        this.leaderBoardbuilder(editEmbed, -1);
                        break;
                }

                //completing edit
                editEmbed.setTitle(embed.title);
                embedMessage.edit(editEmbed);
            });
        });
    },

    leaderBoardArrayMaker: function (sortType) {
        let array = [];
        const sorted = game.Leaderboard.sort(sortingFunctions[String(sortType)]);//getting the sorted data
        for (let player in sorted) {
            player = game.Leaderboard[player];
            let data = [];
            data.push(player.country, player.name, player.supply_centers, player.units);//building data
            array.push(data);
        }
        return array;
    },

    leaderBoardbuilder: function (embed, sortType) {
        let array = this.leaderBoardArrayMaker(sortType);
        for (let player in array) {
            player = array[player];
            embed.addField(
                `Country: ${player[0]}, Played by: ${player[1]}`,
                `Supply-Centers: ${player[2]}, Units: ${player[3]}`
            );
        }
    }
};