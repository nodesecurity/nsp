'use strict';

const Command = require('../lib/command');
const Nsp = require('../');

exports.command = 'check [path]';
exports.description = 'checks a project for known vulnerabilities against the Node Security API';

exports.builder = {
  'warn-only': {
    boolean: true,
    default: false,
    description: 'display vulnerabilities but do not exit with an error code',
    group: 'Output:'
  },
  offline: {
    boolean: true,
    description: 'execute checks without an internet connection',
    group: 'Offline:'
  },
  advisories: {
    description: 'path to local advisories database used in offline checks',
    group: 'Offline:'
  },
  'cvss-threshold': {
    alias: 'threshold',
    description: 'cvss threshold that must be reached in order to exit with an error',
    type: 'number',
    group: 'Output:'
  },
  'cvss-filter': {
    alias: 'filter',
    description: 'cvss score below which findings will be hidden',
    type: 'number',
    group: 'Output:'
  },
  exceptions: {
    type: 'array',
    description: 'advisories to ignore while running this check',
    default: [],
    group: 'Project:'
  },
  org: {
    description: 'nodesecurity organization your project is contained in',
    implies: 'integration',
    group: 'Project:'
  },
  integration: {
    description: 'your project\'s uuid',
    implies: 'org',
    group: 'Project:'
  }
};

exports.handler = Command.wrap('check', (args) => {

  return Nsp.check(args);
});
