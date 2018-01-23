'use strict';

const Preprocessor = require('../../lib/preprocessor');

const Code = require('code');
const Lab = require('lab');

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;

const ExamplePreprocessor = require('./example-preprocessor-file.js');


describe('preprocessor', { parallel: false }, () => {

  it('can be passed undefined and run the default', (done) => {

    const preprocessor = Preprocessor.load();

    expect(preprocessor.check).to.not.be.undefined();
    return done();
  });

  it('will search for a file matching the specified path', (done) => {

    const repoRoot = `${__dirname}/../../`;
    const preprocessor = Preprocessor.load('./test/preprocessor/example-preprocessor-file.js', repoRoot);

    expect(preprocessor.check('test')).to.equal(ExamplePreprocessor.check('test'));
    return done();
  });
});
