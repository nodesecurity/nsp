'use strict';

const Chalk = require('chalk');

exports.error = function (err, args, logger = console) {

  logger.error(Chalk.yellow('(+)'), err.message);
};

exports.success = function (result, args, logger = console) {

  if (result.data.length) {
    return logger.log(Chalk.red('(+)'), result.message);
  }

  logger.log(Chalk.green('(+)'), result.message);
};
