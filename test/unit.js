'use strict';

var Code = require('code');
var Lab = require('lab');
var Nock = require('nock');
var Path = require('path');
var Check = require('../lib/check.js');
var Pkg = require('../package.json');
var SanitizePackage = require('../lib/utils/sanitizePackage.js');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

var workingOptions = {
  package: Path.resolve(__dirname, './data/package.json'),
  shrinkwrap: Path.resolve(__dirname, './data/npm-shrinkwrap.json')
};

var Findings = require('./data/findings.json');

var exceptions = ['https://nodesecurity.io/advisories/39', 'https://nodesecurity.io/advisories/9000'];

describe('check', function () {

  it('Errors when schema is bad', function (done) {

    Check({ notallowed: './package.json' }, function (err) {

      expect(err.message).to.equal('"notallowed" is not allowed');
      done();
    });
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

      expect(err.message).to.equal('package.json is required');
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
      .reply(200, Findings);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(Findings);
      done();
    });
  });

  it('Handles package and shrinkwrap being objects', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, Findings);

    Check({ package: require(workingOptions.package), shrinkwrap: require(workingOptions.shrinkwrap) }, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(Findings);
      done();
    });
  });

  it('Handles package as object and package-lock as path', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, Findings);

    Check({ package: require(Path.resolve(__dirname, './data/package.json')), packagelock: Path.resolve(__dirname, './data/package-lock.json') }, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(Findings);
      done();
    });
  });

  it('Handles package-lock as path but not found', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200, Findings);

    Check({ package: require(Path.resolve(__dirname, './data/package.json')), packagelock: Path.resolve(__dirname, './data/package-lock-not-found.json') }, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.deep.include(Findings);
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
        package: SanitizePackage(require(workingOptions.package)),
        shrinkwrap: require(workingOptions.shrinkwrap),
        exceptions: exceptions
      }))
      .reply(200, Findings);

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('works offline with relative path', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      exceptions: exceptions,
      advisoriesPath: './test/data/advisories.json',
      offline: true
    };

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  it('works offline with absolute path', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      exceptions: exceptions,
      advisoriesPath: Path.resolve(process.cwd(), './test/data/advisories.json'),
      offline: true
    };

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      expect(results).to.exist();
      done();
    });
  });

  // it('works offline with shrinkwrap object', function (done) {

  //   var options = {
  //     shrinkwrap: require(workingOptions.shrinkwrap),
  //     exceptions: exceptions,
  //     advisoriesPath: Path.resolve(process.cwd(), './test/data/advisories.json'),
  //     offline: true
  //   };

  //   Check(options, function (err, results) {

  //     expect(err).to.not.exist();
  //     expect(results).to.exist();
  //     done();
  //   });
  // });

  it('Responds correctly to validation errors', function (done) {

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200);

    Check(function (err, results) {

      expect(err.message).to.equal('package.json is required');
      done();
    });
  });

  it('Uses proxy from nsprc', function (done) {

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap,
      proxy: 'http://127.0.0.1:8080'
    };

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200);

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      done();
    });
  });

  it('Uses proxy from env vars', function (done) {

    process.env.https_proxy = process.env.HTTPS_PROXY = 'http://127.0.0.1:8080';

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap
    };

    Nock('https://api.nodesecurity.io')
      .post('/check')
      .reply(200);

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      done();
    });
  });

  it('Does not fail if env var sets empty string for proxy', function (done) {

    process.env.https_proxy = process.env.HTTPS_PROXY = '';

    var options = {
      package: workingOptions.package,
      shrinkwrap: workingOptions.shrinkwrap
    };

    Check(options, function (err, results) {

      expect(err).to.not.exist();
      delete process.env.https_proxy;
      delete process.env.HTTPS_PROXY;
      done();
    });
  });

  it('Includes X-NSP-VERSION in headers', function (done) {

    Nock('https://api.nodesecurity.io', {
      reqheaders: {
        'X-NSP-VERSION': Pkg.version
      }
    })
      .post('/check')
      .reply(200, Findings);

    Check(workingOptions, function (err, results) {

      expect(err).to.not.exist();
      done();
    });
  });


});
