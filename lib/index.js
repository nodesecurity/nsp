'use strict';

const Fs = require('fs');
const Path = require('path');

const API = require('../lib/api');
const Offline = require('../lib/offline');
const Package = require('../lib/package');

exports.sanitizeParameters = function (args) {

  const result = {};
  result.baseUrl = args.baseUrl || 'https://api.nodesecurity.io';
  result.proxy = args.proxy || process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
  result.path = args.path ? Path.resolve(args.path) : process.cwd();
  result.reporter = args.reporter || 'table';
  result['warn-only'] = args.hasOwnProperty('warn-only') ? args['warn-only'] : false;
  result.exceptions = args.exceptions || [];

  let userConfig;
  try {
    userConfig = JSON.parse(Fs.readFileSync(Path.join(Os.homedir(), '.nsprc')));
  }
  catch (err) {}

  if (userConfig) {
    Object.assign(result, userConfig);
  }

  let config;
  try {
    config = JSON.parse(Fs.readFileSync(Path.join(result.path, '.nsprc')));
  }
  catch (err) {}

  if (config) {
    Object.assign(result, config);
  }

  return result;
};

exports.check = function (args) {

  let pkg = args.pkg;
  const { shrinkwrap, packagelock } = args;

  pkg = Package.sanitize(pkg);

  if (!pkg.name) {
    pkg.name = Path.basename(args.path);
  }

  if (shrinkwrap &&
      !shrinkwrap.name) {

    shrinkwrap.name = pkg.name;
  }

  if (packagelock &&
      !packagelock.name) {

    packagelock.name = pkg.name;
  }

  let check;
  if (!args.offline) {
    const api = new API(args);
    check = api.check(args, { package: pkg, shrinkwrap, packagelock, exceptions: args.exceptions });
  }
  else {
    let advisories;
    try {
      if (args.advisories) {
        advisories = JSON.parse(Fs.readFileSync(Path.resolve(process.cwd(), args.advisories)));
      }
      else {
        advisories = JSON.parse(Fs.readFileSync(Path.join(args.path, 'advisories.json')));
      }
    }
    catch (err) {
      return Promise.reject(new Error('Unable to load local advisories database - run \'nsp gather\''));
    }

    check = Offline.check({ package: pkg, shrinkwrap, packagelock, advisories, exceptions: args.exceptions });
  }

  return check.then((results) => {

    results.message = results.data.length ? `${results.data.length} ${results.data.length === 1 ? 'vulnerability' : 'vulnerabilities'} found` : 'No known vulnerabilities found';
    results.data = results.data.sort((a, b) => b.cvss_score - a.cvss_score);
    return results;
  });
};
