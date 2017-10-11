'use strict';

const Check = require('../commands/check');

const Mock = require('./mock');
const MockFs = require('mock-fs');

const Code = require('code');
const Lab = require('lab');

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const expect = Code.expect;

const server = Mock.api();

// just so it's cached already and we don't have to mock it
require('../reporters/table');

describe('check handler', { parallel: false }, () => {

  beforeEach(() => {

    MockFs({
      '/clean': {
        'package.json': JSON.stringify({
          name: 'clean_package',
          version: '1.0.0',
          dependencies: {}
        })
      },
      '/missing_name': {
        'package.json': JSON.stringify({
          version: '1.0.0',
          dependencies: {}
        })
      },
      '/single': {
        'package.json': JSON.stringify({
          name: 'single_finding',
          version: '1.0.0',
          dependencies: {
            broken_a: '1.0.0'
          }
        })
      },
      '/multiple': {
        'package.json': JSON.stringify({
          name: 'multiple_findings',
          version: '1.0.0',
          dependencies: {
            broken_b: '1.0.0'
          }
        })
      },
      '/offline': {
        'package.json': JSON.stringify({
          name: 'offline_package',
          version: '1.0.0',
          dependencies: {
            broken_a: '1.0.0',
            broken_b: '1.0.0'
          }
        }),
        'npm-shrinkwrap.json': JSON.stringify({
          name: 'offline_package',
          version: '1.0.0',
          dependencies: {
            broken_a: {
              version: '1.0.0'
            },
            broken_b: {
              version: '1.0.0'
            }
          }
        }),
        'advisories.json': JSON.stringify([{
          id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          title: 'test finding',
          author: 'Offline test',
          module_name: 'broken_a',
          publish_date: new Date(),
          cves: [],
          vulnerable_versions: '<=99.999.9999',
          patched_versions: '<0.0.0',
          slug: 'broken_a-test-finding',
          overview: 'broken_a is vulnerable because these tests say so',
          recommendation: 'do nothing because this is just a test',
          references: null,
          legacy_slug: 'broken_a-test-finding',
          allowed_scopes: [
            'public',
            'admin'
          ],
          cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
          cvss_score: 7.5,
          cwe: null
        }])
      },
      '/broken/package.json': '{"name": "incompl'
    });

    return server.start();
  });

  afterEach(() => {

    Mock.resetExit();
    MockFs.restore();
    return server.stop();
  });

  it('can run a clean check', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(0);
      exited = true;
    });

    return Check.handler({
      path: '/clean',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });

  it('can run a check with one finding', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(1);
      exited = true;
    });

    return Check.handler({
      path: '/single',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });

  it('can run a check with multiple findings', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(1);
      exited = true;
    });

    return Check.handler({
      path: '/multiple',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });

  it('can run an offline check', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(1);
      exited = true;
    });

    return Check.handler({
      path: '/offline',
      quiet: true,
      offline: true,
      exceptions: []
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });

  it('can run a check when package.json is missing name field', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(0);
      exited = true;
    });

    return Check.handler({
      path: '/missing_name',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });

  it('exits with status 3 when package.json is invalid', () => {

    let exited = false;
    Mock.exit((code) => {

      expect(code).to.equal(3);
      exited = true;
    });

    return Check.handler({
      path: '/broken',
      quiet: true,
      baseUrl: server.info.uri
    }).then(() => {

      expect(exited).to.equal(true);
    });
  });
});
