'use strict';
var usage = require('../../lib/utils/usage.js')('check.txt');
var Check = require('../check.js');
var Formatters = require('../formatters');
var Path = require('path');

var onCommand = function (args) {

  if (args.help) {
    return usage();
  }

  if (typeof args.output !== 'function') {
    if (Formatters[args.output]) {
      args.output = Formatters[args.output];
    }
    else {
      args.output = Formatters.default;
    }
  }

  var pkgPath = Path.join(process.cwd(), 'package.json');
  var shrinkwrapPath = Path.join(process.cwd(), 'npm-shrinkwrap.json');

  Check({ package: pkgPath, shrinkwrap: shrinkwrapPath, offline: args.offline, advisoriesPath: args.advisoriesPath }, function (err, result) {

    var output = args.output(err, result);
    var exitCode = (err || (result.length && !args['warn-only'])) ? 1 : 0;

    if (output) {
      if (exitCode) {
        console.error(output);
      }
      else {
        console.log(output);
      }
    }
    process.exitCode = exitCode;
  });
};

module.exports = {
  name: 'check',
  options: [
    {
      name: 'offline',
      boolean: true,
      default: false
    },
    {
      name: 'advisoriesPath',
      default: false
    },
    {
      name: 'warn-only',
      boolean: true,
      default: false
    }
  ],
  command: onCommand
};
