'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');
const StripJsonComments = require('strip-json-comments');

const configFile = '.nsprc';
const configPath = Os.homedir();

const read = function (settings = {}) {

  const defaults = {
    path: configPath,
    file: configFile
  };
  const { path, file } = Object.assign({}, defaults, settings);
  try {
    return JSON.parse(StripJsonComments(
      Fs.readFileSync(Path.join(path, file), { encoding: 'utf8' })
    ));
  }
  catch (err) {}
};

exports.update = function (settings) {

  const current = read() || {};

  const updated = Object.assign(current, settings);
  for (const key in updated) {
    if (updated[key] === undefined) {
      delete updated[key];
    }
  }

  try {
    Fs.writeFileSync(Path.join(configPath, configFile), JSON.stringify(updated, null, 2));
  }
  catch (err) {}
};

exports.read = read;
