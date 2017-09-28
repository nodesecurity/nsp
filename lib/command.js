'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');

const Reporters = require('../reporters');

const internals = {};
internals.wrapReporter = function (name, fn, ...args) {

  return new Promise((resolve, reject) => {

    try {
      return resolve(fn(...args));
    }
    catch (err) {
      return reject(err);
    }
  }).catch((err) => {

    console.error(`Error in reporter: ${name}`);
    console.error(err.stack);
    process.exit(4);
  });
};

exports.wrap = function (name, handler) {

  return function (args) {

    const reporter = Reporters.load(args.reporter);

    // we set the default here because if you use yargs to do it
    // it shows up in the output of --help and we don't want that
    if (!args.baseUrl) {
      args.baseUrl = 'https://api.nodesecurity.io';
    }

    args.path = args.path ? Path.resolve(args.path) : process.cwd();

    let userConfig;
    try {
      userConfig = JSON.parse(Fs.readFileSync(Path.join(Os.homedir(), '.nsprc')));
    }
    catch (err) {}

    if (userConfig) {
      Object.assign(args, userConfig);
    }

    let config;
    try {
      config = JSON.parse(Fs.readFileSync(Path.join(args.path, '.nsprc')));
    }
    catch (err) {}

    if (config) {
      Object.assign(args, config);
    }

    return handler(args).then((result) => {

      let maxCvss;
      if (args.filter ||
          args.threshold) {

        maxCvss = Math.max(...result.data.map(item => item.cvss_score));
      }

      if (name === 'check' &&
          args.filter &&
          result.data.length) {

        result.data = result.data.filter(item => item.cvss_score > args.filter);
      }

      let output;
      if (args.quiet) {
        output = Promise.resolve();
      }
      else if (reporter.hasOwnProperty(name) &&
          reporter[name].hasOwnProperty('success')) {

        output = internals.wrapReporter(args.reporter, reporter[name].success, result, args);
      }
      else {
        output = internals.wrapReporter(args.reporter, reporter.success, result, args);
      }

      return output.then(() => {

        if (name === 'check' &&
            result.data.length > 0 &&
            args.warnOnly === false) {

          if (!args.threshold ||
              (args.threshold && maxCvss > args.threshold)) {

            process.exit(1);
          }
        }

        process.exit(0);
      });
    }).catch((err) => {

      let output;
      if (args.quiet) {
        output = Promise.resolve();
      }
      else if (reporter.hasOwnProperty(name) &&
          reporter[name].hasOwnProperty('error')) {

        output = internals.wrapReporter(args.reporter, reporter[name].error, err, args);
      }
      else {
        output = internals.wrapReporter(args.reporter, reporter.error, err, args);
      }

      return output.then(() => {

        if (args.warnOnly === false) {
          if (err.isServer) {
            if (!args['ignore-server-errors']) {
              process.exit(2);
            }
          }
          else {
            process.exit(3);
          }
        }
      });
    });
  };
};
