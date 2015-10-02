'use strict';

const Os = require('os');
const path = require('path');
const Fs = require('fs');

// Do check stuff
module.exports = function (callback) {

  let pkgPath = path.join(process.cwd(), 'package.jso');
  let shrinkwrapPath = path.join(process.cwd(), 'npm-shrinkwrap.json');

  let platform = {
    platform: Os.platform(),
    arch: Os.arch()
  };

  let versions = process.versions;

  let payload = {
    os: platform,
    versions: versions
  };

  Fs.stat(pkgPath, function (pkgErr, stat) {

    if (!pkgErr) {
      payload.pkg = require(pkgPath);
    }

    Fs.stat(shrinkwrapPath, function (swErr, stat) {

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
