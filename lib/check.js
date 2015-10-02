'use strict';

var Os = require('os');
var Fs = require('fs');
var Joi = require('joi');

/*
options should be an object that contains one or more of the keys pkg, shrinkwrap
  {
    pkg: '/path/to/package.json',
    shrinkwrap: '/path/to/npm-shrinkwrap.json'
  }
*/
module.exports = function (options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // validate if options are correct
  var isValid = Joi.validate(options, Joi.object({ pkg: Joi.alternatives().try(Joi.string(), Joi.object()), shrinkwrap: Joi.alternatives().try(Joi.string(), Joi.object()) }).or(['pkg', 'shrinkwrap']));

  if (isValid.error) {
    return callback(isValid.error);
  }

  if (typeof options.pkg === 'string') {
    try {
      options.pkg = require(options.pkg);
    } catch (e) {
      return callback(e);
    }
  }

  if (typeof options.shrinkwrap === 'string') {
    try {
      options.shrinkwrap = require(options.shrinkwrap);
    } catch (e) {
      return callback(e);
    }
  }

  console.log(options);

  // CALL BACK FAKE IT FOR NOW YEEEHAW
  callback(null, [{ module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }, { module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }]);

};
