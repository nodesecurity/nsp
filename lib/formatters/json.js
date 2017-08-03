'use strict';

module.exports = function (err, data, pkgPath) {

  if (err) {
    return JSON.stringify({ 'Error': err.message, 'Debug output': (Buffer.isBuffer(data) ? data.toString() : (data === undefined ? 'undefined' : data)) });
  }

  return JSON.stringify(data, null, 2);
};
