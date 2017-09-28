'use strict';

const Chalk = require('chalk');

exports.error = function (err) {

  console.error(Chalk.yellow('(+) ') + err);
};

exports.success = function (result) {

  if (result.data.length) {
    return console.log(Chalk.red('(+)'), result.data.length, result.data.length === 1 ? 'vulnerability found' : 'vulnerabilities found');
  }
  console.log(Chalk.green('(+)'), 'No known vulnerabilities found');
};
