'use strict';

var Joi = require('joi');
var NPMUtils = require('@requiresafe/npm-utils');
var Semver = require('semver');
var Wreck = require('wreck');

var Conf = require('rc')('requiresafe', { api: { baseUrl: 'https://api.requiresafe.com', json: true } }, []);

// Set defaults
var wreck = Wreck.defaults(Conf.api);

/*
options should be an object that contains one or more of the keys package, shrinkwrap, offline
  {
    package: '/path/to/package.json',
    shrinkwrap: '/path/to/npm-shrinkwrap.json',
    offline: false
  }
*/
module.exports = function (options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var offline = options.offline;
  delete options.offline;

  // validate if options are correct
  var isValid = Joi.validate(options, Joi.object({ package: Joi.alternatives().try(Joi.string(), Joi.object()), shrinkwrap: Joi.alternatives().try(Joi.string(), Joi.object()) }).or(['package', 'shrinkwrap']));

  if (isValid.error) {
    return callback(isValid.error);
  }

  if (typeof options.package === 'string') {
    try {
      options.package = require(options.package);
    } catch (e) {
      return callback(e);
    }
  }

  if (typeof options.shrinkwrap === 'string') {
    try {
      options.shrinkwrap = require(options.shrinkwrap);
    } catch (e) {
      if (offline) {
        // this is a critical error in offline mode
        return callback('npm-shrinkwrap.json is required for offline mode');
      }

      delete options.shrinkwrap;
    }
  }

  if (offline) {
    try {
      var advisories = require('../advisories');
    } catch (e) {
      return callback('Offline mode requires a local advisories.json');
    }

    advisories = advisories.results;
    NPMUtils.getShrinkwrapDependencies(options.shrinkwrap, function (err, tree) {

      if (err) {
        return callback(err);
      }

      var keys = Object.keys(tree);
      var vulns = keys.map(function (key) {

        var mod = tree[key];
        var matches = [];
        for (var i = 0, il = advisories.length; i < il; ++i) {
          if (mod.name === advisories[i].module_name &&
              Semver.satisfies(mod.version, advisories[i].vulnerable_versions)) {

            matches.push(advisories[i]);
          }
        }

        return {
          module: mod.name,
          version: mod.version,
          vulnerabilities: matches
        };
      }).filter(function (mod) {

        return mod.vulnerabilities.length > 0;
      });

      var results = [];
      for (var i = 0, il = vulns.length; i < il; ++i) {
        var path = tree[vulns[i].module + '@' + vulns[i].version].parents;
        for (var x = 0, xl = vulns[i].vulnerabilities.length; x < xl; ++x) {
          results.push({
            module: vulns[i].module,
            version: vulns[i].version,
            title: vulns[i].vulnerabilities[x].title,
            path: path,
            advisory: 'https://requiresafe.com/advisories/' + vulns[i].vulnerabilities[x].id
          });
        }
      }

      return callback(null, results);
    });
  }
  else {
    wreck.post('/check', { payload: JSON.stringify(options) }, function (err, res, payload) {

      callback(err, payload);
    });
  }
};
