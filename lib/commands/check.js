'use strict';
var usage = require('../../lib/utils/usage.js')('check.txt');
var Check = require('../check.js');
var Path = require('path');

var onCommand = function (args) {

  if (args.help) {
    return usage();
  }

  if (typeof args.output !== 'function') {
    args.output = require('../formatters/' + args.output);
  }

  if (args.offline) {
    // do offline stuff
    return console.log('doing offline stuffs');
  }

  var pkgPath = Path.join(process.cwd(), 'package.json');
  var shrinkwrapPath = Path.join(process.cwd(), 'npm-shrinkwrap.json');

  Check({ package: pkgPath, shrinkwrap: shrinkwrapPath }, function (err, result) {

    args.output(err, result);
    if (err) {
      return process.exit(1);
    }
    return process.exit(0);
  });
};

module.exports = {
  name: 'check',
  options: [
    {
      name: 'offline',
      boolean: true
    }
  ],
  command: onCommand
};



