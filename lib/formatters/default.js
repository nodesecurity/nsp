'use strict';

const Chalk = require('chalk');
const Table = require('cli-table');

module.exports = function (data) {

  if (data.length === 0) {

    return console.log(Chalk.green('(+)') + ' No known vulnerabilities found');
  }

  console.log(Chalk.red('(+) ') + data.length + ' vulnerabilities found\n');


  data.map(function (finding) {

    let table = new Table({
      head: ['', finding.title],
      colWidths: [15, 65]
    });

    table.push(['Name', finding.module]);
    table.push(['Version', finding.version]);
    table.push(['Path', finding.path]);
    table.push(['More Info', finding.advisory]);

    console.log(table.toString());
    console.log('\n');

  });

};
