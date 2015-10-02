'use strict';

let fs = require('fs');
let path = require('path');

let usage = function (location) {

  console.error(fs.readFileSync(path.join(__dirname, '../', 'usage', location)).toString());
};

module.exports = function (location) {

  return function () {

    return usage(location);
  };
};


