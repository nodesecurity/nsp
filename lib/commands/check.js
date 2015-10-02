'use strict';

var Fs = require('fs');
var Path = require('path');
var FindRoot = require('find-root');
var Offline = require('../offline');
var jwtDecode = require('jsonwebtoken').decode;

exports.help = [
  'Checks your project\'s dependencies for vulnerabilities by submitting your package.json (and npm-shrinkwrap.json if it exists) to requiresafe for validation.',
  'Note that if npm-shrinkwrap exists, it will be considered the authority for your project and your package.json will be ignored.'
];

exports.run = function (config) {

  try {
    var root = FindRoot(process.cwd());
  }
  catch (e) {
    return Promise.resolve(['package.json missing', 1]);
  }

  var result = {};
  var packageFile = Path.join(root, 'package.json');
  var shrinkWrap = Path.join(root, 'npm-shrinkwrap.json');
  var loggedIn = config.token && config.token.length > 1;

  var logResults = function (results) {

    if (results.data === 'OK') {
      return Promise.resolve('✔ No known vulnerabilities found');
    }

    return Promise.resolve([results.data, 1]);
  };

  var tokenData = loggedIn && jwtDecode(config.token);

  try {
    result.package = JSON.parse(Fs.readFileSync(packageFile, 'utf8'));
  }
  catch (err) {
    throw new Error('Unable to read package.json file: ' + packageFile);
  }

  try {
    result.shrinkWrap = JSON.parse(Fs.readFileSync(shrinkWrap, 'utf8'));
  }
  catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error('Unable to read npm-shrinkwrap.json file: ' + shrinkWrap);
    }
  }

  if (config.codeclimate) {
    return Offline.check(result);
  }

  if (loggedIn &&
        tokenData.entity !== 'app' &&
        !config.org) {

    return config.api.get('/users/me').then(function (me) {

      if (me.data.orgs.length === 0) {
        throw new Error('You do not belong to any orgs');
      }

      if (me.data.orgs.length === 1) {
        return config.api.post('/orgs/' + me.data.orgs[0].id + '/projects/check', { project: result }).then(logResults);
      }

      throw new Error('You belong to multiple orgs, you need to specify one on the command line');
    });
  }

  if (tokenData.entity === 'app') {
    return config.api.post('/orgs/' + tokenData.app.org_id + '/projects/check', { project: result }).then(logResults);
  }

  return config.api.post('/projects/check', { project: result }).then(logResults);
};
