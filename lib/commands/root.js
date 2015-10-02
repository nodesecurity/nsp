'use strict';
const usage = require('../../lib/usage.js')('root.txt');

const onCommand = function (args) {

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


