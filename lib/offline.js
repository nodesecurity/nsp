/*eslint camelcase: [1, {properties: "never"}]*/
'use strict';

var ChildProcess = require('child_process');
var Fs = require('fs');
var Path = require('path');
var Semver = require('semver');

var internals = {};

internals.findAdvisoryByNameAndSemver = function (advisories, name, version) {

  var matches = [];
  advisories.forEach(function (advisory) {

    if (advisory.module_name !== name) {
      return;
    }

    for (var i = 0, il = advisory.vulnerable_versions.length; i < il; ++i) {
      var ver = advisory.vulnerable_versions[i];
      if (!Semver.satisfies(version, ver.version_range)) {
        return;
      }
    }

    matches.push(advisory);
  });

  return matches;
};

internals.getAncestry = function (tree, ancestry) {

  var newAncestry = [];
  var allDone = true;

  ancestry.forEach(function (ancestor) {

    if (tree[ancestor[0]].parents &&
      tree[ancestor[0]].parents.length) {

      allDone = false;
      tree[ancestor[0]].parents.forEach(function (parent) {

        var path = [parent].concat(ancestor);
        for (var i = 0, il = newAncestry.length; i < il; ++i) {
          if (newAncestry[i].join(',') === path.join(',')) {
            return;
          }
        }

        newAncestry.push(path);
      });
    }
    else {
      newAncestry.push(ancestor);
    }
  });

  if (!allDone) {
    return internals.getAncestry(tree, newAncestry);
  }

  return newAncestry;
};

internals.ancestryToString = function (ancestry) {

  return ancestry.map(function (ms) {

    return internals.splitModuleString(ms).name;
  }).join(' > ');
};

internals.splitModuleString = function (mod) {

  var lastAt = mod.lastIndexOf('@');

  return {
    name: mod.slice(0, lastAt),
    version: mod.slice(lastAt + 1)
  };
};

internals.formatVulnerabilities = function (tree, mods, project) {

  var issues = [];
  for (var i = 0, il = mods.length; i < il; ++i) {
    var mod = mods[i];
    for (var v = 0, vl = mod.vulnerabilities.length; v < vl; ++v) {
      var vuln = mod.vulnerabilities[v];
      var issue = {
        type: 'issue',
        check_name: 'vulnerable module "' + mod.moduleString + '"identified',
        description: vuln.title,
        categories: ['Security'],
        location: {
          path: project.shrinkWrap ? 'npm-shrinkwrap.json' : 'package.json',
          lines: {
            begin: 0,
            end: 0
          }
        }
      };

      issues.push(JSON.stringify(issue));
    }
  }

  return issues.join('\0\n');
};

internals.getLocal = function () {

  return new Promise(function (resolve, reject) {

    var deps = '';
    var npm = ChildProcess.spawn('npm', ['ls', '--json']);
    npm.stdout.on('data', function (data) {

      deps += data;
    });

    npm.on('close', function (code) {

      try {
        deps = JSON.parse(deps);
        return resolve(deps);
      }
      catch (e) {
        return reject(e);
      }
    });
  });
};

exports.check = function (result) {

  if (!Fs.existsSync(Path.resolve(Path.join(__dirname, '..', 'advisories.json')))) {
    throw new Error('Offline mode unavailable when advisories.json is missing');
  }

  var tree = {};

  var parseModule = function (module, parents, name) {

    var moduleName = (name || module.name) + '@' + module.version;
    var children = Object.keys(module.dependencies || {}).concat(Object.keys(module.devDependencies || {}));

    if (tree[moduleName]) {
      tree[moduleName].parents = tree[moduleName].parents.concat(parents);
    }
    else {
      tree[moduleName] = {
        name: name || module.name,
        version: module.version,
        parents: parents,
        children: children,
        source: 'npm'
      };
    }

    for (var i = 0, il = children.length; i < il; ++i) {
      var child = children[i];
      parseModule(module.dependencies[child], [moduleName], child);
    }
  };

  var check = function (shrinkwrap) {

    parseModule(shrinkwrap, []);
    var advisories = JSON.parse(Fs.readFileSync(Path.resolve(Path.join(__dirname, '..', 'advisories.json')), 'utf8'));
    var findings = Object.keys(tree).map(function (mod) {

      var modSplit = internals.splitModuleString(mod);
      return {
        moduleString: mod,
        vulnerabilities: internals.findAdvisoryByNameAndSemver(advisories, modSplit.name, modSplit.version)
      };
    }).filter(function (mod) {

      return mod.vulnerabilities.length > 0;
    });

    if (findings.length === 0) {
      return Promise.resolve('');
    }

    return Promise.resolve(internals.formatVulnerabilities(tree, findings, result));
  };

  if (result.shrinkWrap) {
    return check(result.shrinkWrap);
  }

  return internals.getLocal().then(function (shrinkwrap) {

    return check(shrinkwrap);
  });
};
