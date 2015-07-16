var Chalk = require('chalk');

exports.help = [
    'Prints your user profile'
];

exports.run = function (config) {

    return config.api.get('/users/me').then(function (me) {

        var myself = '';
        ['id', 'email', 'name'].forEach(function (field) {

            myself += '  ' + Chalk.bold(field) + ': ' + me.data[field] + '\n';
        });
        myself += '  ' + Chalk.bold('orgs') + ':\n';
        myself += '    ' + me.data.orgs.map(function (org) {

            return org.name + ': ' + org.id + '/' + org._pivot_role;
        }).join('\n');

        return myself;
    });
};
