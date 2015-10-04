'use strict';
var usage = require('../../lib/utils/usage.js')('root.txt');

var onCommand = function (args) {

  if (args.version) {
    return console.log(require('../../package.json').version);
  }
  return usage();

};


module.exports = {
  name: '',
  options: [
    { name: 'version', alias: 'v', boolean: false }
  ],
  command: onCommand
};


