'use strict';

var Chalk = require('chalk');
var Table = require('cli-table');
var Cvss = require('cvss');

module.exports = function (err, data, pkgPath) {

  var returnString = '';

  if (err) {
    if (data) {
      returnString += Chalk.red('(+) ') + 'Debug output: ' + JSON.stringify(Buffer.isBuffer(data) ? data.toString() : data) + '\n';
    }

    return returnString + Chalk.yellow('(+) ') + err;
  }

  var width = 80;
  var colWidth = 15;
  if (process.stdout.isTTY) {
    width = process.stdout.getWindowSize()[0] - 10;
    if (!width || width <= colWidth) {
      width = 80;
    }
  }
  if (data.length === 0) {

    return '';
  }

  returnString += Chalk.red('(+) ') + data.length + ' vulnerabilities found\n';


  return returnString;
};
