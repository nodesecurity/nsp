'use strict';
var usage = require('../../lib/usage.js')('check.txt');

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

  // do stuff that requires the api
  return args.output([{ module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }, { module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }]);
  //return console.log('check command called');
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



