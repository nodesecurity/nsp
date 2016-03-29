'use strict';

var Fs = require('fs');
var Path = require('path');

var usage = function (location) {

  console.error(Fs.readFileSync(Path.join(__dirname, '../../', 'usage', location)).toString());
};

module.exports = function (location) {

  return function () {

    return usage(location);
  };
};


