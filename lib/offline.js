var Chalk = require('chalk');
var ChildProcess = require('child_process');
var Fs = require('fs');
var Path = require('path');
var Semver = require('semver');
var TextTable = require('text-table');

var internals = {};

internals.findAdvisoryByNameAndSemver = function (advisories, name, version) {

    var matches = [];
    advisories.forEach(function (advisory) {

        if (advisory.module_name !== name) {
            return;
        }

        for (var i = 0, il = advisory.vulnerable_versions.length; i < il; ++i) {
            var ver = advisory.vulnerable_versions[i];
            if (!Semver.satisfies(version, ver.version_range)) {
                return;
            }
        }

        matches.push(advisory);
    });

    return matches;
};

internals.getAncestry = function (tree, ancestry) {

    var newAncestry = [];
    var allDone = true;

    ancestry.forEach(function (ancestor) {

        if (tree[ancestor[0]].parents &&
            tree[ancestor[0]].parents.length) {

            allDone = false;
            tree[ancestor[0]].parents.forEach(function (parent) {

                var path = [parent].concat(ancestor);
                for (var i = 0, il = newAncestry.length; i < il; ++i) {
                    if (newAncestry[i].join(',') === path.join(',')) {
                        return;
                    }
                }

                newAncestry.push(path);
            });
        }
        else {
            newAncestry.push(ancestor);
        }
    });

    if (!allDone) {
        return internals.getAncestry(tree, newAncestry);
    }

    return newAncestry;
};

internals.ancestryToString = function (ancestry) {

    return ancestry.map(function (ms) {

        return internals.splitModuleString(ms).name;
    }).join(' > ');
};

internals.splitModuleString = function (mod) {

    var lastAt = mod.lastIndexOf('@');

    return {
        name: mod.slice(0, lastAt),
        version: mod.slice(lastAt + 1)
    };
};

internals.formatVulnerabilities = function (tree, vulns) {

    var rows = [
        ['Name', 'Installed', 'Patched', 'Location', 'Advisory Details'].map(function (header) {

            return Chalk.underline(header);
        })
    ];

    vulns = vulns.sort(function (a, b) {

        if (a.moduleString < b.moduleString) {
            return -1;
        }

        if (a.moduleString > b.moduleString) {
            return 1;
        }

        return 0;
    });

    vulns.forEach(function (vuln) {

        var ancestors = internals.getAncestry(tree, [[vuln.moduleString]]);
        var mod = internals.splitModuleString(vuln.moduleString);
        var vulnerabilities = vuln.vulnerabilities.map(function (v) {

            return {
                slug: v.slug,
                type: v.type,
                patched: v.patched_versions.map(function (pv) {

                    return pv.version_range;
                })
            };
        });

        var patched = vulnerabilities.filter(function (v) {

            return v.patched.length;
        });

        var patchedString = patched.length !== vulnerabilities.length ? Chalk.red('x') : Chalk.green(patched.sort(function (a, b) {

            return a.patched < b.patched ? -1 : a.patched > b.patched ? 1 : 0;
        }).pop().patched);

        if (vulnerabilities.length &&
            vulnerabilities.filter(function (v) {

                return v.type === 'vulnerability';
            }).length) {

            mod.version = Chalk.red(mod.version);
        }
        else {
            mod.version = Chalk.yellow(mod.version);
        }

        var advisories = vulnerabilities.map(function (v) {

            return 'https://portal.requiresafe.com/advisories/' + v.slug;
        }).join(' ');

        ancestors.forEach(function (ancestor, i) {

            ancestry = internals.ancestryToString(ancestor);

            if (i === 0) {
                rows.push([mod.name, mod.version, patchedString, ancestry, advisories]);
            }
            else {
                rows.push(['', '', '', ancestry]);
            }
        });
    });

    return TextTable(rows, {
        align: ['l', 'r', 'r', 'l', 'l', 'l'],
        stringLength: function (s) {

            return Chalk.stripColor(s).length;
        }
    });
};

internals.getLocal = function (callback) {

    var deps = '';
    var npm = ChildProcess.spawn('npm', ['ls', '--json']);
    npm.stdout.on('data', function (data) {

        deps += data;
    });

    npm.on('close', function (code) {

        try {
            deps = JSON.parse(deps);
            return callback(null, deps);
        }
        catch (e) {
            return callback(e);
        }
    });
};

exports.check = function (result, callback) {

    if (!Fs.existsSync(Path.resolve(Path.join(__dirname, '..', 'advisories.json')))) {
        throw new Error('Offline mode unavailable when advisories.json is missing');
    }

    var tree = {};

    var parseModule = function (module, parents, name) {

        var moduleName = (name || module.name) + '@' + module.version;
        var children = Object.keys(module.dependencies || {}).concat(Object.keys(module.devDependencies || {}));

        if (tree[moduleName]) {
            tree[moduleName].parents = tree[moduleName].parents.concat(parents);
        }
        else {
            tree[moduleName] = {
                name: name || module.name,
                version: module.version,
                parents: parents,
                children: children,
                source: 'npm'
            };
        }

        for (var i = 0, il = children.length; i < il; ++i) {
            var child = children[i];
            parseModule(module.dependencies[child], [moduleName], child);
        }
    };

    var check = function (shrinkwrap) {

        parseModule(shrinkwrap, []);
        var basePath = Path.resolve(Path.join(__dirname, '..', 'node_modules', 'nodesecurity-www', 'advisories'));
        Fs.readdir(basePath, function (err, files) {

            if (err) {
                return callback(err);
            }

            var advisories = JSON.parse(Fs.readFileSync(Path.resolve(Path.join(__dirname, '..', 'advisories.json')), 'utf8'));
            var findings = Object.keys(tree).map(function (mod) {

                var modSplit = internals.splitModuleString(mod);
                return {
                    moduleString: mod,
                    vulnerabilities: internals.findAdvisoryByNameAndSemver(advisories, modSplit.name, modSplit.version)
                };
            }).filter(function (mod) {

                return mod.vulnerabilities.length > 0;
            });

            if (findings.length === 0) {
                return callback(null, 'OK');
            }

            return callback(null, internals.formatVulnerabilities(tree, findings));
        });
    };

    if (result.shrinkWrap) {
        return check(result.shrinkWrap);
    }

    internals.getLocal(function (err, shrinkwrap) {

        if (err) {
            return callback(err);
        }

        return check(shrinkwrap);
    });
};
