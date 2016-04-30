'use strict';

var whitelist = [
  'name',
  'version',
  'engine',
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
  'bundleDependencies',
  'bundledDependencies'
];

module.exports = function sanitizePackage (pkg) {

  if (!pkg) {
    return pkg;
  }
  var result = {};
  for (var keyIndex = 0; keyIndex < whitelist.length; keyIndex++) {
    var key = whitelist[keyIndex];
    var value = pkg[key];
    if (value) {
      result[key] = value;
    }
  }
  return result;
};
