'use strict';

var fs = require('fs');
var path = require('path');

var usage = function (location) {

  console.error(fs.readFileSync(path.join(__dirname, '../../', 'usage', location)).toString());
};

module.exports = function (location) {

  return function () {

    return usage(location);
  };
};


