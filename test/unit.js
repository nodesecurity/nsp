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

var exceptions = ['https://nodesecurity.io/advisories/39', 'https://nodesecurity.io/advisories/9000'];

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

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(404);

    Check({ package: '../package.json', shrinkwrap: './npm-shrinkwrap.json' }, function (err) {

      expect(err.message).to.equal('Got an invalid response from Node Security, please email the above debug output to support@nodesecurity.io');
      done();
    });
  });

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

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, []);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.equal([]);
      done();
    });
  });

  it('Responds correctly to receiving a 200 and findings', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, findings);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(findings);
      done();
    });
  });

  it('Handles package and shrinkwrap being objects', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, findings);

    Check({ package: require(workingOptions.package), shrinkwrap: require(workingOptions.shrinkwrap) }, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(findings);
      done();
    });
  });

  it('Responds correctly to a misc error', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .replyWithError('Error: Client request error: connect ECONNREFUSED https://api.nodesecurity.io');

    Check(workingOptions, function (err, results) {

      expect(err).to.exist();
      expect(err.output.payload.message).to.equal('Error: Client request error: connect ECONNREFUSED https://api.nodesecurity.io');
      done();
    });
  });

  it('Sends exceptions', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      exceptions: exceptions
    };

    Nock('https://api.nodesecurity.io')
      .post('/check', JSON.stringify({
        package: require(workingOptions.package),
        shrinkwrap: require(workingOptions.shrinkwrap),
        exceptions: exceptions
      }))
      .reply(200, findings);

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('Works offline', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      exceptions: exceptions,
      advisoriesPath: '../test/data/advisories',
      offline: true
    };

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('Responds correctly to validation errors', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200);

    Check(function (err, results) {

      expect(err.message).to.equal('"value" must contain at least one of [package, shrinkwrap]');
      done();
    });
  });

  it('Uses proxy', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      proxy: 'http://127.0.0.1:8080'
    };

    Nock('http://127.0.0.1:8080')
      .post('/check')
      .reply(200);

    Check(options, function (err, results) {

      done();
    });
  });
});
