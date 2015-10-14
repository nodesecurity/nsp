'use strict';

module.exports = function (err, data) {

	return {
		exitCode: err ? 1 : 0
	}
};
