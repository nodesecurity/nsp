var lab = exports.lab = require('lab').script();
var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;

var Chalk = require('chalk');
var CLI = require('../lib/cli');
var Commands = require('../lib/commands');
var fullHelp = Object.keys(Commands).map(function (command) {

    return [
        '  ' + Chalk.bold(command),
        '    ' + Commands[command].help.join('\n    ')
    ].join('\n');
}).join('\n\n');

describe('CLI', function () {

    it('returns help when run with no args', function (done) {

        CLI.run(function (err, response) {

            expect(err).to.not.exist();
            expect(response).to.deep.equal(fullHelp);
            done();
        });
    });

    it('returns help when run with an invalid command', function (done) {

        CLI.run({ _: ['broken'] }, function (err, response) {

            expect(err).to.not.exist();
            expect(response).to.deep.equal(fullHelp);
            done();
        });
    });

    it('returns help when run with the "help" command', function (done) {

        CLI.run({ _: ['help'] }, function (err, response) {

            expect(err).to.not.exist();
            expect(response).to.deep.equal(fullHelp);
            done();
        });
    });

    // it('checks runs the "check"', { timeout: 10000 }, function (done) {

    //     CLI.run({ _: ['check'] }, function (err, response) {

    //         expect(err).to.not.exist();
    //         expect(response).to.deep.equal('something');
    //         done();
    //     });
    // });
});
