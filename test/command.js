'use strict';

var Code = require('code');
var Lab = require('lab');
var mockery = require('mockery');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var afterEach = lab.afterEach;
var expect = Code.expect;

//var exceptions = ['https://nodesecurity.io/advisories/39', 'https://nodesecurity.io/advisories/9000'];
var check;
var checkErr = null;
var checkResult = [];

describe('check', function () {

  before(function (done) {

    mockery.enable({
      warnOnUnregistered: false,
      warnOnReplace: false,
      useCleanCache: true
    });

    mockery.registerMock('../../lib/utils/usage.js', function () {

      return Function.prototype;
    });

    mockery.registerMock('../../lib/index', {
      getFormatter: function () {
        return Function.prototype;
      }
    });

    mockery.registerMock('../check.js', function (options, next) {

      next(checkErr, checkResult);
    });

    check = require('../lib/commands/check');

    done();
  });

  after(function (done) {

    mockery.disable();
    done();
  });

  afterEach(function (done) {

    checkErr = null;
    checkResult = [];
    done();
  });

  it('Shows usage if called with help argument', function (done) {

    check.command({
      help: true
    });

    done();
  });

  it('Returns with exit code 1 for error', function (done) {

    checkErr = new Error('test');

    check.command({
      offline: true,
      output: function (err, result) {
      }
    });

    expect(process.exitCode).to.equal(1);

    done();
  });

  it('Returns with exit code 1 for advisory', function (done) {

    checkResult = [{
      cvss_score: 7.5,
      patched_versions: '>= 1.4.1 < 2.0.0 || >= 2.0.3'
    }];

    check.command({
      output: 'quiet'
    });

    expect(process.exitCode).to.equal(1);

    done();
  });

  it('Returns with exit code 0 and output if --warn-only is given', function (done) {

    checkResult = [{
      cvss_score: 7.5,
      patched_versions: '>= 1.4.1 < 2.0.0 || >= 2.0.3'
    }];

    check.command({
      'warn-only': true,
      output: function (err, result) {

        expect(result[0].exit_code).to.equal(0);
        return result;
      }
    });

    expect(process.exitCode).to.equal(0);

    done();
  });

  it('Returns with exit code 1 and output if --warn-unpatched is given with patched advisory', function (done) {

    checkResult = [{
      cvss_score: 7.5,
      patched_versions: '>= 1.4.1 < 2.0.0 || >= 2.0.3'
    }, {
      cvss_score: 9,
      patched_versions: '<0.0.0'
    }];

    check.command({
      'warn-unpatched': true,
      output: function (err, result) {

        expect(result[0].exit_code).to.equal(1);
        expect(result[1].exit_code).to.equal(0);
        return result;
      }
    });

    expect(process.exitCode).to.equal(1);

    done();
  });

  it('Returns with exit code 0 and output if --warn-unpatched is given with unpatched advisory', function (done) {

    checkResult = [{
      cvss_score: 9,
      patched_versions: '<0.0.0'
    }];

    check.command({
      'warn-unpatched': true,
      output: function (err, result) {

        expect(result[0].exit_code).to.equal(0);
        return result;
      }
    });

    expect(process.exitCode).to.equal(0);

    done();
  });

  it('Returns with exit code 1 and output if --warn-score is given with higher score', function (done) {

    checkResult = [{
      cvss_score: 7,
      patched_versions: '>= 1.4.1 < 2.0.0 || >= 2.0.3'
    }, {
      cvss_score: 9,
      patched_versions: '<0.0.0'
    }];

    check.command({
      'warn-score': 7.5,
      output: function (err, result) {

        expect(result[0].exit_code).to.equal(0);
        expect(result[1].exit_code).to.equal(1);
        return result;
      }
    });

    expect(process.exitCode).to.equal(1);

    done();
  });

  it('Returns with exit code 0 and output if --warn-score is given with lower score', function (done) {

    checkResult = [{
      cvss_score: 5.3,
      patched_versions: '<0.0.0'
    }];

    check.command({
      'warn-score': 6,
      output: function (err, result) {

        expect(result[0].exit_code).to.equal(0);
        return result;
      }
    });

    expect(process.exitCode).to.equal(0);

    done();
  });


});
