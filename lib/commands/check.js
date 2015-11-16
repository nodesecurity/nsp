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

  Check({ package: pkgPath, shrinkwrap: shrinkwrapPath, offline: args.offline }, function (err, result, rootPackageName) {

    var output = args.output(err, result);

    if(!err && args['subdep-warn-only']) {
      // Only the package direct dependencies should impact the status code
      result = result.filter(function(entry) {
        return entry.path[0] === rootPackageName;
      });
    }

    var exitCode = (err || (result.length && !args['warn-only'])) ? 1 : 0;

    if (output) {
      if (exitCode) {
        console.error(output);
      }
      else {
        console.log(output);
      }
    }
    return process.exit(exitCode);
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
      name: 'warn-only',
      boolean: true,
      default: false
    },
    {
      name: 'subdep-warn-only',
      boolean: true,
      default: false
    }
  ],
  command: onCommand
};
