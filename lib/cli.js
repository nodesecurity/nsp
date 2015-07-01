var Rc = require('rc');
var Commands = require('./commands');
var SDK = require('requiresafe-sdk');

var aliases = {
    'ls': 'list',
    'l': 'list',
    'h': 'help'
};

var proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;

// The main CLI method, accepts the command arguments and a callback
exports.run = function (args, callback) {

    if (typeof args === 'function') {
        callback = args;
        args = undefined;
    }

    var config = Rc('requiresafe', {
        token: ''
    }, args);
    // did the user specify a command?
    var passedCommand = config._[0];

    // figure out what the command was
    // default to `commands.help` if
    // not passed or not found
    var command = passedCommand && Commands[passedCommand] || Commands[aliases[passedCommand]];

    if (!command) {
        command = Commands.help;
    }

    config.api = new SDK({
        authToken: config.token,
        local: config.hasOwnProperty('local'),
        proxy: proxy
    });
    config.commands = Commands;

    // Run the requested command
    command.run(config, callback);
};
