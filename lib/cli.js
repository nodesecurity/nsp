var Commands = require('./commands');
var Promise = require('es6-promise').Promise;
var Rc = require('rc');
var SDK = require('requiresafe-sdk');

var aliases = {
    'ls': 'list',
    'l': 'list',
    'h': 'help'
};

// The main CLI method, accepts the command arguments and a callback
exports.run = function () {

    var config = Rc('requiresafe', {
        token: ''
    });

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
        baseUrl: config.baseUrl,
        authToken: config.token,
        local: typeof config.local === 'boolean' ? config.local : false,
        proxy: process.env.HTTP_PROXY || config.proxy
    });

    config.commands = Commands;

    // Run the requested command
    return command.run(config);
};
