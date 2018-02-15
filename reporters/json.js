'use strict';

exports.error = function (err, args, logger = console) {

  logger.error(JSON.stringify(args.verbose ? err : { error: err.message }));
};

exports.success = function (result, args, logger = console) {

  logger.log(JSON.stringify(args.verbose ? result : result.data));
};
