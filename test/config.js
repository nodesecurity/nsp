'use strict';

const Path = require('path');
const { expect } = require('code');
const { describe, it } = exports.lab = require('lab').script();

const Config = require('../lib/config');

describe('Config', () => {

  it('should not explode when user config not found', (done) => {

    expect(Config.read({ path: '/wrong/path', file: '.wrong-file' })).to.equal(undefined);
    done();
  });

  it('should return user config stripping the comments', (done) => {

    const configPath = Path.resolve(process.cwd(), './test/configs/');
    const expectedConfig = require('./configs/stripped');
    expect(Config.read({ path: configPath })).to.equal(expectedConfig);
    done();
  });
});
