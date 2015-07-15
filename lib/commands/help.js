var Chalk = require('chalk');
var Promise = require('es6-promise').Promise;

exports.help = [
    'Print the help text'
];

exports.run = function (config) {

    var helpText;
    var fullHelp = Object.keys(config.commands).map(function (cmd) {

        return [
            '  ' + Chalk.bold(cmd),
            '    ' + config.commands[cmd].help.join('\n    ')
        ].join('\n');
    }).join('\n\n');

    if (config._.length === 1) {
        helpText = fullHelp;
    }
    else {
        var command = config._[1];
        if (!config.commands[command]) {
            helpText = fullHelp;
        }
        else {
            helpText = [
                '  ' + Chalk.bold(command),
                '    ' + config.commands[command].help.join('\n    ')
            ].join('\n');
        }
    }

    return Promise.resolve(helpText);
};
