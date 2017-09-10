'use strict';

var Lockfile = require('@yarnpkg/lockfile');

module.exports = {
  parse: function yarnParse(contents, packageJson) {

    var result = Lockfile.parse(contents);

    var dependencies = Object.keys(packageJson).reduce(function (acc, key) {

      return  typeof packageJson[key] === 'object' ?
        Object.assign(acc, packageJson[key]) :
        acc;
    }, {});

    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: module.exports.buildTree(dependencies, result.object)
    };
  },
  buildTree: function (dependencies, yarn) {

    return Object.keys(dependencies).reduce(function (acc, packageName) {

      var version = dependencies[packageName];
      var info = yarn[packageName + '@' + version];
      if (!info) {
        throw new Error('yarn.lock is outdated: it does not contain the package ' + packageName + '@' + version);
      }
      acc[packageName] = {
        'version': version,
        'dependencies': typeof info.dependencies === 'object' ?
          module.exports.buildTree(info.dependencies, yarn) :
          undefined
      };
      return acc;
    }, {});
  }
};
