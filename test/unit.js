'use strict';

var Code = require('code');
var Lab = require('lab');
var Check = require('../lib/check.js');
var Nock = require('nock');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('check', function () {

  lab.beforeEach(function (done) {

    Nock('https://api.requiresafe.com').post('/check').reply(404);
    done();
  });

  it('Responds correctly when package.json can\'t be found', function (done) {

    Check({ package: './package.json' }, function (err) {

      expect(err.message).to.equal('Cannot find module \'./package.json\'');
      done();
    });
  });

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

  it('Responds correctly on 404', function (done) {

    Nock('https://api.requiresafe.com')
      .post('/check')
      .reply(404);

    Check({ package: '../package.json', shrinkwrap: './npm-shrinkwrap.json' }, function (err) {

      expect(err.message).to.equal('Got an invalid response from requireSafe, please email the above debug output to support@requiresafe.com');
      done();
    });
  });

  it('Responds correctly to package being undefined', { timeout: 10000 }, function (done) {

    Check({ package: undefined, shrinkwrap: './npm-shrinkwrap.json' }, function (err) {

      expect(err.message).to.equal('package.json is required');
      done();
    });
  });

  it('Responds correctly to both package and shrinkwrap being undefined', { timeout: 10000 }, function (done) {

    Check({ package: undefined, shrinkwrap: undefined }, function (err) {

      expect(err.message).to.equal('"value" must contain at least one of [package, shrinkwrap]');
      done();
    });
  });
});
