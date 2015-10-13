'use strict';

var Code = require('code');
var Lab = require('lab');
var Nock = require('nock');
var Path = require('path');
var Check = require('../lib/check.js');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

var workingOptions = {
  package: Path.resolve(__dirname, './data/package.json'),
  shrinkwrap: Path.resolve(__dirname, './data/npm-shrinkwrap.json')
};

var findings = require('./data/findings.json');

describe('check', function () {

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
    })
;  });

  it('Responds correctly to package being undefined', function (done) {

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

  it('Responds correctly to receiving a 200 but no findings', function (done) {

    Nock('https://api.requiresafe.com')
      .post('/check')
      .reply(200, []);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.equal([]);
      done();
    });
  });

  it('Responds correctly to receiving a 200 and findings', function (done) {

    Nock('https://api.requiresafe.com')
      .post('/check')
      .reply(200, findings);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(findings);
      done();
    });
  });

  it('responds correctly to a misc error', function (done) {

    Nock('https://api.requiresafe.com')
      .post('/check')
      .replyWithError('Error: Client request error: connect ECONNREFUSED https://api.requiresafe.com');

    Check(workingOptions, function (err, results) {

      expect(err).to.exist();
      expect(err.output.payload.message).to.equal('Error: Client request error: connect ECONNREFUSED https://api.requiresafe.com');
      done();
    });
  });

  it('sends exceptions', function (done) {

    var exceptions = ['https://requiresafe.com/advisories/39', 'https://requiresafe.com/advisories/9000'];

    Nock('https://api.requiresafe.com')
      .post('/check', JSON.stringify({
        package: require(workingOptions.package),
        shrinkwrap: require(workingOptions.shrinkwrap),
        exceptions: exceptions
      }))
      .reply(200, findings);

    Check(Object.assign(workingOptions, { exceptions: exceptions }), function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('works offline', function (done) {

    Check(Object.assign(workingOptions, { advisoriesPath: '../test/data/advisories', offline: true }), function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('responds correctly to validation errors', function (done) {

    Nock('https://api.requiresafe.com')
      .post('/check')
      .reply(200);

    Check(function (err, results) {

      expect(err.message).to.equal('"value" must contain at least one of [package, shrinkwrap]');
      done();
    });
  });
});
