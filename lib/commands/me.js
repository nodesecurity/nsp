var Chalk = require('chalk');

exports.help = [
    'Prints your user profile'
];

exports.run = function (config, callback) {

    config.api.me(function (err, me) {

        if (err) {
            return callback(new Error('Not logged in'));
        }

        var myself = '';
        for (var field in me) {
            myself += '  ' + Chalk.bold(field) + ': ' + me[field] + '\n';
        }

        return callback(null, myself);
    });
};
