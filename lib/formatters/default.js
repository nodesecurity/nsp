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
  if (process.stdout.isTTY) {
    width = process.stdout.getWindowSize()[0] - 10;
  }
  if (data.length === 0) {

    return Chalk.green('(+)') + ' No known vulnerabilities found';
  }

  returnString += Chalk.red('(+) ') + data.length + ' vulnerabilities found\n';

  data.sort(function(a, b) {

    return b.cvss_score - a.cvss_score;
  }).forEach(function (finding) {

    var table = new Table({
      head: ['', finding.title],
      colWidths: [15, width - 15]
    });

    table.push(['Name', finding.module]);
    table.push(['CVSS', finding.cvss_score + ' (' + Cvss.getRating(finding.cvss_score) + ')']);
    table.push(['Installed', finding.version]);
    table.push(['Vulnerable', finding.vulnerable_versions === '<=99.999.99999' ? 'All' : finding.vulnerable_versions]);
    table.push(['Patched', finding.patched_versions === '<0.0.0' ? 'None' : finding.patched_versions]);
    table.push(['Path', finding.path.join(' > ')]);
    table.push(['More Info', finding.advisory]);

    returnString += table.toString() + '\n';
  });

  return returnString;
};
