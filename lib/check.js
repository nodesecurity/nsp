'use strict';

var Os = require('os');
var path = require('path');
var Fs = require('fs');

// Do check stuff
module.exports = function (callback) {

  var pkgPath = path.join(process.cwd(), 'package.jso');
  var shrinkwrapPath = path.join(process.cwd(), 'npm-shrinkwrap.json');

  var platform = {
    platform: Os.platform(),
    arch: Os.arch()
  };

  var versions = process.versions;

  var payload = {
    os: platform,
    versions: versions
  };

  Fs.stat(pkgPath, function (pkgErr, pkgStat) {

    if (!pkgErr) {
      payload.pkg = require(pkgPath);
    }

    Fs.stat(shrinkwrapPath, function (swErr, swStat) {

      if (pkgErr && swErr) {
        return callback(new Error('A package.json or npm-shrinkwrap.json is required'));
      }

      if (!swErr) {
        payload.shrinkwrap = require(shrinkwrapPath);
      }

      // CHECK THE API

      // CALL BACK FAKE IT FOR NOW YEEEHAW
      callback(null, [{ module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }, { module: 'marked', version: '0.3.0', title: 'This is a fake module advisory title', path: ['meta-marked', 'marked'], advisory: 'https://rsafe.at/bananas' }]);

    });
  });

};
