'use strict';

module.exports = function (err, data, pkgPath) {

  if (err) {
    return 'Debug output: ' + JSON.stringify(Buffer.isBuffer(data) ? data.toString() : data) + '\n' + JSON.stringify(err);
  }

  return JSON.stringify(data, null, 2);
};
