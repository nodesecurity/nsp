var Inquirer = require('inquirer');
var Chalk = require('chalk');
var Config = require('../config');

exports.help = [
    'Logs you in to the requiresafe service'
];

exports.run = function (config, callback) {

    var required = function (value) {

        return !!value.trim() || Chalk.red('required');
    };

    var questions = [
        {
            name: 'email',
            message: 'enter your email',
            validate: required,
            default: config.email
        },
        {
            name: 'password',
            message: 'enter your password (never saved)',
            validate: required,
            type: 'password'
        }
    ];

    Inquirer.prompt(questions, function (answers) {

        config.api.login({
            email: answers.email,
            password: answers.password,
            expires: false
        }, function (err, data) {

            if (err) {
                return callback(err);
            }

            var token = data.authToken;
            Config.update({ email: answers.email, token: token }, function () {

                if (err) {
                    return callback(err);
                }

                return callback(null, 'You\'re logged in. An auth token has been saved to $HOME/.requiresaferc');
            });
        });
    });
};
