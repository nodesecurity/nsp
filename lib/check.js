'use strict';

var Joi = require('joi');
var Wreck = require('wreck');

/*
options should be an object that contains one or more of the keys package, shrinkwrap
  {
    package: '/path/to/package.json',
    shrinkwrap: '/path/to/npm-shrinkwrap.json'
  }
*/
module.exports = function (options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // validate if options are correct
  var isValid = Joi.validate(options, Joi.object({ package: Joi.alternatives().try(Joi.string(), Joi.object()), shrinkwrap: Joi.alternatives().try(Joi.string(), Joi.object()) }).or(['package', 'shrinkwrap']));

  if (isValid.error) {
    return callback(isValid.error);
  }

  if (typeof options.package === 'string') {
    try {
      options.package = require(options.package);
    } catch (e) {
      return callback(e);
    }
  }

  if (typeof options.shrinkwrap === 'string') {
    try {
      options.shrinkwrap = require(options.shrinkwrap);
    } catch (e) {
      delete options.shrinkwrap;
    }
  }


  Wreck.post('http://127.0.0.1:5000/check', { json: true, payload: JSON.stringify(options) }, function (err, res, payload) {

    callback(err, payload);
  });
};
