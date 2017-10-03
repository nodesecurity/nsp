'use strict';

const Login = require('../commands/login');

const Fs = require('fs');
const Mock = require('./mock');
const MockFs = require('mock-fs');
const Os = require('os');
const Path = require('path');

const Code = require('code');
const Lab = require('lab');

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const expect = Code.expect;

const server = Mock.api();

describe('login handler', () => {

  beforeEach(() => {

    MockFs();
    return server.start();
  });

  afterEach(() => {

    Mock.resetExit();
    MockFs.restore();
    return server.stop();
  });

  it('saves token when login succeeds', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(0);
      exited = true;
    });

    return Login.handler({
      email: 'test@user.com',
      password: 'testuser',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
      const config = JSON.parse(Fs.readFileSync(Path.join(Os.homedir(), '.nsprc')));
      expect(config).to.be.an.object();
      expect(config.token).to.equal('thisisafaketoken');
    });
  });

  it('exits with error when login fails', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(3);
      exited = true;
    });

    return Login.handler({
      email: 'wrong@user.com',
      password: 'shouldfail',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });
});
