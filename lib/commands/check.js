var Fs = require('fs');
var Path = require('path');
var FindRoot = require('find-root');
var Offline = require('../offline');
var jwtDecode = require('jsonwebtoken').decode;

exports.help = [
    'Checks your project\'s dependencies for vulnerabilities by submitting your package.json (and npm-shrinkwrap.json if it exists) to requiresafe for validation.',
    'Note that if npm-shrinkwrap exists, it will be considered the authority for your project and your package.json will be ignored.'
];

exports.run = function (config, callback) {

    var root = FindRoot(process.cwd());
    var result = {};
    var packageFile = Path.join(root, 'package.json');
    var shrinkWrap = Path.join(root, 'npm-shrinkwrap.json');
    var loggedIn = config.token && config.token.length > 1;

    var logResults = function (err, results) {

        if (err) {
            return callback(err);
        }

        if (results === 'OK') {
            return callback(null, '✔ No known vulnerabilities found');
        }

        return callback(null, results, 1);
    };

    var tokenData = loggedIn && jwtDecode(config.token);

    try {
        result.package = JSON.parse(Fs.readFileSync(packageFile, 'utf8'));
    }
    catch (err) {
        return callback(new Error('Unable to read package.json file: ' + packageFile));
    }

    try {
        result.shrinkWrap = JSON.parse(Fs.readFileSync(shrinkWrap, 'utf8'));
    }
    catch (err) {
        if (err.code !== 'ENOENT') {
            return callback(new Error('Unable to read npm-shrinkwrap.json file: ' + shrinkWrap));
        }
    }

    var check = config.offline ? Offline.check : config.api.checkDependencies.bind(config.api);

    if (config.offline) {
        return Offline.check(result, logResults);
    }

    if (loggedIn && tokenData.entity !== 'app' && !config.org) {
        config.api.me(function (err, me) {

            if (err) {
                return callback(err);
            }

            if (me.orgs.length === 0) {
                return callback(new Error('You do not belong to any orgs'));
            } else if (me.orgs.length === 1) {
                return config.api._makeRequest('post', '/orgs/' + me.orgs[0].id + '/projects/check', { project: result }, logResults);
            }

            //anonymous check
            return callback(new Error('You belong to multiple orgs, you need to specify one on the command line'));
        });
    } else if (tokenData.entity === 'app') {
        config.api._makeRequest('post', '/orgs/' + tokenData.app.org_id + '/projects/' + tokenData.app.project_id + '/check', { project: result }, logResults);
    } else {
        config.api.checkDependencies(result, logResults);
    }
};
