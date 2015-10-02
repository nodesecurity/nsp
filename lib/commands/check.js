'use strict';
var usage = require('../../lib/usage.js')('check.txt');

let onCommand = function (args) {

  if (args.help) {
    return usage();
  }

  if (typeof args.output !== 'function') {
    console.log('using output formatter ' + args.output);
    args.output = require('../formatters/' + args.output);
  }

  args.output('asdf');
  if (args.offline) {
    // do offline stuff
    return console.log('doing offline stuffs');
  }

  // do stuff that requires the api
  return console.log('check command called');
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



