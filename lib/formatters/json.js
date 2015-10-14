'use strict';

module.exports = function (err, data) {

  if (err) {
    return {
      result: 'Debug output: ' + data + '\n' + JSON.stringify(err),
      exitCode: 1
    };
  }

  return {
    result: JSON.stringify(data, null, 2),
    exitCode: 1
  };
};
