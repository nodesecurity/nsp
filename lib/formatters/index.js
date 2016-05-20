'use strict';

module.exports = {
  checkstyle: require('./checkstyle'),
  codeclimate: require('./codeclimate'),
  default: require('./default'),
  summary: require('./summary'),
  json: require('./json'),
  none: require('./none')
};
