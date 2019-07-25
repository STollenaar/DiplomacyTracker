'use strict';

module.exports = (mapIndex, season, year) => {
	const diff = Math.abs(-1 - mapIndex);
	let startSeason;
	let startYear;

	// switching the season correctly
	if (!(diff % 2 === 0)) {
		if (season === 'Spring') {
			startSeason = 'Autum';
		}
		else {
			startYear = 'Spring';
		}
	}
	// setting the year correctly
	startYear = year - Math.ceil(diff / 2);
	return {startSeason, startYear};
};
