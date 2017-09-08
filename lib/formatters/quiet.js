'use strict';

var Chalk = require('chalk');

module.exports = function (err, data, pkgPath) {

  var returnString = '';

  if (err) {
    if (data) {
      returnString += Chalk.red('(+) ') + 'Debug output: ' + JSON.stringify(Buffer.isBuffer(data) ? data.toString() : data) + '\n';
    }

    return returnString + Chalk.yellow('(+) ') + err;
  }

  if (data.length === 0) {

    return '';
  }

  returnString += Chalk.red('(+) ') + data.length + ' vulnerabilities found\n';


  return returnString;
};
