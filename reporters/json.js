'use strict';

exports.error = function (err, args) {

  console.error(JSON.stringify(args.verbose ? err : { error: err.message + (err.statusCode === 400 && ' ' + err.data.message) }));
};

exports.success = function (result, args) {

  console.log(JSON.stringify(args.verbose ? result : result.data));
};
