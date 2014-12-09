var abbrev = require('abbrev');
var mout = require('mout');
var commands = require('./commands');
var shared = require('./util/shared');
var cli = require('./util/cli');

var abbreviations = abbrev(expandNames(commands));
abbreviations.i = 'install';
abbreviations.rm = 'uninstall';
abbreviations.unlink = 'uninstall';
abbreviations.ls = 'list';
require('../../package.json');
shared.set("options", cli.readOptions({
    'force-latest': {type: Boolean, shorthand: 'F'},
    'production': {type: Boolean, shorthand: 'p'},
    'save': {type: Boolean, shorthand: 'S'},
    'save-dev': {type: Boolean, shorthand: 'D'}
}, process.argv));

function expandNames (obj, prefix, stack) {
    prefix = prefix || '';
    stack = stack || [];

    mout.object.forOwn(obj, function (value, name) {
        name = prefix + name;

        stack.push(name);

        if (typeof value === 'object' && !value.line) {
            expandNames(value, name + ' ', stack);
        }
    });

    return stack;
}

function clearRuntimeCache () {
    // Note that in edge cases, some architecture components instance's
    // in-memory cache might be skipped.
    // If that's a problem, you should create and fresh instances instead.
    var PackageRepository = require('./core/PackageRepository');
    PackageRepository.clearRuntimeCache();
}

module.exports = {
    commands: commands,
    config: require('./config'),
    abbreviations: abbreviations,
    reset: clearRuntimeCache
};
