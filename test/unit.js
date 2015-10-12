'use strict';

var Code = require('code');
var Lab = require('lab');
var Check = require('../lib/check.js');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('check', function () {

  it('Responds correctly when offline and can\' find a local advisories.json', function (done) {

    Check({ package: '../package.json', shrinkwrap: '../npm-shrinkwrap.json', offline: true }, function (err) {

      expect(err.message).to.equal('Offline mode requires a local advisories.json');
      done();
    });
  });

  it('Responds correctly when offline and can\'t find a npm-shrinkwrap.json', function (done) {

    Check({ package: '../package.json', shrinkwrap: './npm-shrinkwrap.json', offline: true }, function (err) {

      expect(err.message).to.equal('npm-shrinkwrap.json is required for offline mode');
      done();
    });
  });
});
