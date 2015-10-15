'use strict';

module.exports = function (err, data) {

  if (err) {
    return 'Debug output: ' + data + '\n' + JSON.stringify(err);
  }

  return JSON.stringify(data, null, 2);
};
