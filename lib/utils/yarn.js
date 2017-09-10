'use strict';

var Lockfile = require('@yarnpkg/lockfile');

module.exports = {
  parse: function yarnParse(contents, packageJson) {

    var result = Lockfile.parse(contents);

    var dependencies = Object.keys(packageJson).reduce(function (acc, key) {

      return  typeof packageJson[key] === 'object' && key !== "engines" ?
        Object.assign(acc, packageJson[key]) :
        acc;
    }, {});

    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: module.exports.buildTree(dependencies, result.object, [packageJson.name])
    };
  },
  buildTree: function (dependencies, yarn, path) {

    return Object.keys(dependencies).reduce(function (acc, packageName) {

      var version = dependencies[packageName];
      var packageNV = packageName + '@' + version;
      var info = yarn[packageNV];

      if (!info) {
        throw new Error('yarn.lock is outdated: it does not contain the package ' + packageNV);
      }

      if (path.indexOf(packageNV) >= 0) {
        // Prevent looping over circular dependencies (for example babel-register@^6.26.0 > babel-core@^6.26.0 > babel-register@^6.26.0)
        return acc;
      }
      var currentPath = path.slice(0);
      currentPath.push(packageNV);

      acc[packageName] = {
        'version': info.version,
        'dependencies': typeof info.dependencies === 'object' ?
          module.exports.buildTree(info.dependencies, yarn, currentPath) :
          undefined
      };
      return acc;
    }, {});
  }
};
