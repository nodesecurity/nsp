'use strict';

var Chalk = require('chalk');
var Table = require('cli-table');

module.exports = function (err, data, pkgPath) {

  var returnString = '';

  if (err) {
    if (data) {
      returnString += Chalk.red('(+) ') + 'Debug output: ' + JSON.stringify(Buffer.isBuffer(data) ? data.toString() : data) + '\n';
    }

    return returnString + Chalk.yellow('(+) ') + err;
  }

  if (data.length === 0) {

    return Chalk.green('(+)') + ' No known vulnerabilities found';
  }

  returnString += Chalk.red('(+) ') + data.length + ' vulnerabilities found\n';

  var table = new Table({
    head: ['Name', 'Installed', 'Patched', 'Path', 'More Info'],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      'bottom': '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      'mid': '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' '
    }
  });

  data.forEach(function (finding) {

    table.push([finding.module, finding.version, finding.patched_versions === '<0.0.0' ? 'None' : finding.patched_versions, finding.path.join(' > '), finding.advisory]);
  });

  returnString += table.toString() + '\n';
  return returnString;
};
