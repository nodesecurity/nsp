var Config = require('../config');

exports.help = [
    'Logs you out by removing your authentication token'
];

exports.run = function (config) {

    return Config.update({ token: '' }).then(function () {

        return 'You\'ve been logged out';
    });
};
