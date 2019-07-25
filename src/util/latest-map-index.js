'use strict';

module.exports = (index, game) => {
	if (index !== -2) { return index; }

	const [season, year] = game.date.split(', ');
	return (year - game.startYear) * 2 + (season === game.startSeason ? 0 : 1);// returning the correct map index
};
