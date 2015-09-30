'use strict';

var Fs = require('fs');
var Path = require('path');

var requireAll = function () {

  var modules = {};
  var files = Fs.readdirSync(__dirname);

  files = files.filter(function (file) {

    return file !== 'index.js' && /\.js$/.test(file);
  }).map(function (file) {

    return file.replace(/\.js$/, '');
  });

  files.forEach(function (file) {

    modules[file] = require(Path.join(__dirname, file));
  });

  return modules;
};

module.exports = requireAll();
