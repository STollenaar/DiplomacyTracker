let game;
let RichEmbed;

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

        module.exports.leaderBoardbuilder(embed, -1);

        //scrolling through map timeline
        message.channel.send(embed).then(async embedMessage => {
            await embedMessage.react('🚗');
            await embedMessage.react('🏭');
            await embedMessage.react('🌎');
            await embedMessage.react('🔤');
            await embedMessage.react('❌');

            let collector = embedMessage.createReactionCollector(filter, { time: 180000 });

            collector.on('collect', (reaction, reactionCollector) => {
                let editEmbed = new RichEmbed();

                //scrolling correctly
                switch (reaction.emoji.name) {
                    case '🚗':
                        module.exports.leaderBoardbuilder(editEmbed, 2);
                        break;
                    case '🏭':
                        module.exports.leaderBoardbuilder(editEmbed, 1);
                        break;
                    case '🌎':
                        module.exports.leaderBoardbuilder(editEmbed, 3);
                        break;
                    case '🔤':
                        module.exports.leaderBoardbuilder(editEmbed, 0);
                        break;
                    case '❌':
                        module.exports.leaderBoardbuilder(editEmbed, -1);
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
        let sorted;
        switch (sortType) {
            //default
            case -1:
                for (let player in game.Leaderboard) {
                    player = game.Leaderboard[player];
                    let data = [];
                    data.push(player.country, player.name, player.supply_centers, player.units);
                    array.push(data);
                }
                break;
            //sorting by name
            case 0:
                sorted = game.Leaderboard.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                for (let player in sorted) {
                    player = game.Leaderboard[player];
                    let data = [];
                    data.push(player.country, player.name, player.supply_centers, player.units);
                    array.push(data);
                }

                break;
            //sorting by amount supply_centers
            case 1:
                sorted = game.Leaderboard.sort(function (a, b) {
                    return b.supply_centers - a.supply_centers;
                });
                for (let player in sorted) {
                    player = game.Leaderboard[player];
                    let data = [];
                    data.push(player.country, player.name, player.supply_centers, player.units);
                    array.push(data);
                }
                break;
            //sorting by amount units
            case 2:
                sorted = game.Leaderboard.sort(function (a, b) {
                    return b.units - a.units;
                });
                for (let player in sorted) {
                    player = game.Leaderboard[player];
                    let data = [];
                    data.push(player.country, player.name, player.supply_centers, player.units);
                    array.push(data);
                }
                break;
            //sort by country
            case 3:
                sorted = game.Leaderboard.sort(function (a, b) {
                    a = a.country.toLowerCase();
                    b = b.country.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                for (let player in sorted) {
                    player = game.Leaderboard[player];
                    let data = [];
                    data.push(player.country, player.name, player.supply_centers, player.units);
                    array.push(data);
                }
                break;
        }
        return array;
    },

    leaderBoardbuilder: function (embed, sortType) {
        let array = module.exports.leaderBoardArrayMaker(sortType);
        for (let player in array) {
            player = array[player];
            embed.addField(
                "Country: " + player[0] + ", Played by: " + player[1],
                "Supply-Centers: " + player[2] + ", Units: " + player[3]
            );
        }
    }
};