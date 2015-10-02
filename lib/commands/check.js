'use strict';
const usage = require('../../lib/usage.js')('check.txt');
const Check = require('../check.js');

let onCommand = function (args) {

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

  Check(function (err, result) {

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



