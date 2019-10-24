'use strict';

const getLatestMapIndex = require('./latest-map-index');

module.exports = (game, mapIndex = 0) => {
	const diff = Math.abs(mapIndex - getLatestMapIndex(-2, game));
	let [season, year] = game.date.split(', ');

	// switching the season correctly
	if (!(diff % 2 === 0)) {
		if (season === 'Spring') {
			season = 'Autum';
		}
		else {
			season = 'Spring';
		}
	}
	// setting the year correctly
	year -= Math.floor(diff / 2);
	return {season, year};
};
