'use strict';

var Code = require('code');
var Lab = require('lab');
var Pkg = require('../package.json');
var SanitizePackage = require('../lib/utils/sanitizePackage.js');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('sanitizePackage', function () {

  it('removes fields not in the whitelist', function (done) {

    var expected = {
      name: Pkg.name,
      version: Pkg.version,
      dependencies: Pkg.dependencies,
      devDependencies: Pkg.devDependencies
    };
    var actual = SanitizePackage(Pkg);

    expect(actual).to.deep.equal(expected);
    done();
  });

});
