'use strict';

const Path = require('path');

const API = require('../lib/api');
const Command = require('../lib/command');
const Offline = require('../lib/offline');
const Package = require('../lib/package');

exports.command = 'check [path]';
exports.description = 'checks a project for known vulnerabilities against the Node Security API';

exports.builder = {
  'warn-only': {
    boolean: true,
    default: false,
    description: 'display vulnerabilities but do not exit with an error code'
  },
  offline: {
    boolean: true,
    description: 'execute checks without an internet connection'
  },
  advisories: {
    description: 'path to local advisories database used in offline checks'
  },
  'cvss-threshold': {
    alias: 'threshold',
    description: 'cvss threshold that must be reached in order to exit with an error',
    type: 'number'
  },
  filter: {
    description: 'cvss score below which findings will be hidden',
    type: 'number'
  }
};

exports.handler = Command.wrap('check', function (args) {

  let path = args.path ? Path.resolve(args.path) : process.cwd();

  let pkg;
  try {
    pkg = require(Path.join(path, 'package.json'));
  }
  catch (err) {
    return Promise.reject(new Error(`Unable to load package.json for project: ${Path.basename(path)}`));
  }
  pkg = Package.sanitize(pkg);

  let shrinkwrap;
  try {
    shrinkwrap = require(Path.join(path, 'npm-shrinkwrap.json'));
  }
  catch (err) {}

  let packagelock;
  try {
    packagelock = require(Path.join(path, 'package-lock.json'));
  }
  catch (err) {}

  let check;
  if (!args.offline) {
    const api = new API(args);
    check = api.check({ package: pkg, shrinkwrap, packagelock });
  }
  else {
    let advisories;
    try {
      if (args.advisories) {
        advisories = require(Path.resolve(process.cwd(), args.advisories));
      }
      else {
        advisories = require(Path.join(__dirname, '..', 'advisories.json'));
      }
    }
    catch (err) {
      return Promise.reject(new Error('Unable to load local advisories database'));
    }

    let exceptions = args.exceptions || [];
    check = Offline.check({ package: pkg, shrinkwrap, packagelock, advisories, exceptions });
  }

  return check.then((results) => {

    results.message = results.data.length ? `${results.data.length} ${results.data.length === 1 ? 'vulnerability' : 'vulnerabilities'} found` : 'No known vulnerabilities found';
    results.data = results.data.sort((a, b) => b.cvss_score - a.cvss_score);
    return results;
  });
});
