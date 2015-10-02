'use strict';

module.exports = function (err, data) {

  if (err) {
    return console.log(JSON.stringify(err));
  }

  return console.log(JSON.stringify(data, null, 2));

};
