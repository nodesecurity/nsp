'use strict';

module.exports = function (err, data) {

  if (err) {
    console.error('Debug output: %j', data);
    return console.error(JSON.stringify(err));
  }

  return console.log(JSON.stringify(data, null, 2));

};
