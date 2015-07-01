var Config = require('../config');

exports.help = [
    'Logs you out by removing your authentication token'
];

exports.run = function (config, callback) {

    Config.update({ token: '' }, function (err) {

        if (err) {
            return callback(err);
        }

        return callback(null, 'You\'ve been logged out');
    });
};
