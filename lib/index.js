'use strict';

var Formatters = require('./formatters');

var getFormatter = function (name) {

  if (Object.keys(Formatters).indexOf(name) !== -1) {
    return Formatters[name];
  }

  try {
    return require('nsp-formatter-' + name);
  }
  catch (e) {}

  return Formatters.default;
};

module.exports = {
  check: require('./check'),
  formatters: Formatters,
  getFormatter: getFormatter
};
