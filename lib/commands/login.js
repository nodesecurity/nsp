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

    return new Promise(function (resolve, reject) {

        Inquirer.prompt(questions, function (answers) {

            return resolve(answers);
        });
    }).then(function (answers) {

        return config.api.login(answers.email, answers.password).then(function (token) {

            return Config.update({ email: answers.email, token: token });
        });
    }).then(function () {

        return 'You\'re logged in. An auth token has been saved to $HOME/.requiresaferc';
    });
};
