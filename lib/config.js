// utility for writing values to the config file
// You can "delete" keys by setting them to "".
// If the resulting config object is empty, the config file will be deleted
var Fs = require('fs');
var Path = require('path');
var Promise = require('es6-promise').Promise;

exports.update = function (settings) {

    var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
    var configPath = Path.join(home, '.requiresaferc');
    var current = {};
    try {
        current = JSON.parse(Fs.readFileSync(configPath));
    }
    catch (err) {}

    for (var setting in settings) {
        if (settings[setting] === '') {
            delete current[setting];
        }
        else {
            current[setting] = settings[setting];
        }
    }

    // if it's empty delete the config file entirely to clean up
    // after ourselves.
    if (Object.keys(current).length === 0) {
        try {
            Fs.unlinkSync(configPath);
        }
        catch (err) {}

        return callback(null);
    }

    // try to write it back
    return new Promise(function (resolve, reject) {

        Fs.writeFile(configPath, JSON.stringify(current, null, 2), 'utf8', function (err) {

            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
};
