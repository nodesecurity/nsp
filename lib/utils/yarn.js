'use strict';

var Lockfile = require('@yarnpkg/lockfile');

module.exports = {
	parse: function yarnParse(contents) {
		var result = Lockfile.parse(contents);
		module.exports.processPackages(result.object);
		module.exports.deepenDependencies(result.object);
		return result.object;
	},
	deepenDependencies: function deepenDependencies(deps) {
		Object.keys(deps).forEach(function (dep) {
			if (typeof deps[dep] === 'string') {
				deps[dep] = { version: deps[dep] };
			}
		});
	},
	processPackages: function processPackages(object) {
		Object.keys(object).forEach(function (packageAtVersion) {
			// Nested dependencies must be { version: "x" } instead of "x"
			if (typeof object[packageAtVersion].dependencies === 'object') {
				module.exports.deepenDependencies(object[packageAtVersion].dependencies);
			}

			// Strip version from 'package@^6.1.2'
			// Handle package scopes like '@types/nsp@1.2.0'
			var versionAt = packageAtVersion.indexOf('@', 1);
			if (versionAt >= 1) {
				var packageName = packageAtVersion.substr(0, versionAt);
				if (typeof object[packageName] === 'undefined') {
					object[packageName] = object[packageAtVersion];
					delete object[packageAtVersion];
				}
			}
		});
	},
};
