'use strict';

var Fs = require('fs');
var Joi = require('joi');
var NPMUtils = require('nodesecurity-npm-utils');
var ProxyAgent = require('https-proxy-agent');
var Semver = require('semver');
var Path = require('path');
var Wreck = require('wreck');
var PathIsAbsolute = require('path-is-absolute');
var SanitizePackage = require('./utils/sanitizePackage');

var Conf = require('rc')('nsp', {
  api: {
    baseUrl: 'https://api.nodesecurity.io',
    json: true,
    headers: {
      'X-NSP-VERSION': require('../package.json').version
    }
  }
}, []);

var internals = {};
internals.findLines = function (shrinkwrap, module, version) {

  var modRE = new RegExp('\\s*\"' + module + '\":\\s*\\{\\s*([^\\}]*)\\}', 'gm');
  var versionRE = new RegExp('\\s*\"version\":\\s*\"' + version + '\"', 'gm');
  var found = false;
  while (!found) {
    var match = modRE.exec(shrinkwrap);
    if (versionRE.test(match[0])) {
      found = true;
    }

  }

  var start = shrinkwrap.slice(0, match.index).split('\n').length + 1;
  var end = shrinkwrap.slice(0, match.index + match[0].length).split('\n').length;
  return {
    start: start,
    end: end
  };
};

internals.exceptionRegex = /^https\:\/\/nodesecurity\.io\/advisories\/([0-9]+)$/;

internals.optionSchema = Joi.object({
  package: Joi.alternatives().try(Joi.string(), Joi.object()),
  shrinkwrap: Joi.alternatives().try(Joi.string(), Joi.object()),
  exceptions: Joi.array().items(Joi.string().regex(internals.exceptionRegex)).default([]),
  advisoriesPath: Joi.string(),
  proxy: Joi.string()
}).or(['package', 'shrinkwrap']);

/*
options should be an object that contains one or more of the keys package, shrinkwrap, offline, advisoriesPath
  {
    package: '/path/to/package.json',
    shrinkwrap: '/path/to/npm-shrinkwrap.json',
    offline: false,
    advisoriesPath: undefined
  }
*/
module.exports = function (options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var proxy = options.proxy || Conf.proxy;
  proxy = proxy || process.env.https_proxy || process.env.HTTPS_PROXY;
  delete options.proxy;

  if (proxy) {
    Conf.api.agent = new ProxyAgent(proxy);
  }

  // Set defaults
  var wreck = Wreck.defaults(Conf.api);

  var shrinkwrap;
  var offline = options.offline;
  delete options.offline;

  var advisoriesPath = options.advisoriesPath || Conf.advisoriesPath;
  delete options.advisoriesPath;

  if (!options.exceptions) {
    options.exceptions = Conf.exceptions;
  }

  // validate if options are correct
  var isValid = Joi.validate(options, internals.optionSchema);

  if (isValid.error) {
    return callback(isValid.error);
  }

  options = isValid.value;

  if (typeof options.package === 'string') {
    try {
      options.package = require(options.package);
    }
    catch (e) {
      return callback(e);
    }
  }

  options.package = SanitizePackage(options.package);

  if (typeof options.shrinkwrap === 'string') {
    try {
      shrinkwrap = Fs.readFileSync(require.resolve(options.shrinkwrap), 'utf8');
      options.shrinkwrap = require(options.shrinkwrap);
    }
    catch (e) {
      delete options.shrinkwrap;
    }
  }
  else {
    shrinkwrap = JSON.stringify(options.shrinkwrap, null, 2);
  }

  if (offline) {
    var advisories;

    if (!options.shrinkwrap) {
      return callback(new Error('npm-shrinkwrap.json is required for offline mode'));
    }
    try {
      if (advisoriesPath) {
        if (!PathIsAbsolute(advisoriesPath)) {
          advisoriesPath = Path.resolve(process.cwd(), advisoriesPath);
        }

        advisories = require(advisoriesPath);
      }
      else {
        advisories = require('../advisories');
      }
    }
    catch (e) {
      return callback(new Error('Offline mode requires a local advisories.json'));
    }


    advisories = advisories.results;
    var exceptions = options.exceptions.map(function (exception) {

      return Number(internals.exceptionRegex.exec(exception)[1]);
    });

    var generateContent = function (advisory) {

      var markdown = [
        '# ' + advisory.title,
        '## Overview:',
        advisory.overview
      ];

      if (advisory.recommendation) {
        markdown.push('');
        markdown.push('## Recommendation:');
        markdown.push(advisory.recommendation);
      }

      if (advisory.references) {
        markdown.push('');
        markdown.push('## References:');
        markdown.push(advisory.references);
      }

      return markdown.join('\n');
    };

    NPMUtils.getShrinkwrapDependencies(options.shrinkwrap, function (err, tree) {

      var keys = Object.keys(tree);
      var vulns = keys.map(function (key) {

        var mod = tree[key];
        var matches = [];
        for (var i = 0, il = advisories.length; i < il; ++i) {
          if (mod.name === advisories[i].module_name &&
              exceptions.indexOf(advisories[i].id) === -1 &&
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
        var path = tree[vulns[i].module + '@' + vulns[i].version].paths;
        var line = internals.findLines(shrinkwrap, vulns[i].module, vulns[i].version);
        for (var x = 0, xl = vulns[i].vulnerabilities.length; x < xl; ++x) {
          results.push({
            module: vulns[i].module,
            version: vulns[i].version,
            vulnerable_versions: vulns[i].vulnerabilities[x].vulnerable_versions,
            patched_versions: vulns[i].vulnerabilities[x].patched_versions,
            title: vulns[i].vulnerabilities[x].title,
            path: path,
            advisory: 'https://nodesecurity.io/advisories/' + vulns[i].vulnerabilities[x].id,
            line: line,
            content: generateContent(vulns[i].vulnerabilities[x])
          });
        }
      }

      return callback(null, results);
    });
  }
  else {
    if (!options.package) {
      return callback(new Error('package.json is required'));
    }
    wreck.post('/check', { payload: JSON.stringify(options) }, function (err, res, payload) {

      if (err) {
        return callback(err);
      }

      if (res.statusCode !== 200) {
        err = new Error('Got an invalid response from Node Security, please email the above debug output to support@nodesecurity.io');
      }

      callback(err, payload);
    });
  }
};
