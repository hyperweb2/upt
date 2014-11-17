var path = require('path');
var upt = require('../../lib/index.js');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var fs = require('fs');
var expect = require('expect.js');
var scripts = require('../../lib/core/scripts.js');

describe('scripts', function () {

    var tempDir = path.join(__dirname, '../tmp/temp-scripts');
    var packageName = 'package-zip';
    var packageDir = path.join(__dirname, '../assets/' + packageName + '.zip');

    var config = {
        cwd: tempDir,
        scripts: {
            preinstall: 'touch preinstall_%',
            postinstall: 'touch postinstall_%',
            preuninstall: 'touch preuninstall_%'
        }
    };

    before(function (next) {
        mkdirp(tempDir, next);
    });

    after(function (next) {
        rimraf(tempDir,  next);
    });

    it('should run preinstall and postinstall hooks.', function (next) {

        upt.commands
        .install([packageDir], undefined, config)
        .on('end', function (installed) {

            expect(fs.existsSync(path.join(tempDir, 'preinstall_' + packageName))).to.be(true);
            expect(fs.existsSync(path.join(tempDir, 'postinstall_' + packageName))).to.be(true);

            next();
        });

    });

    it('should run preuninstall hook.', function (next) {

        upt.commands
        .uninstall([packageName], undefined, config)
        .on('end', function (installed) {

            expect(fs.existsSync(path.join(tempDir, 'preuninstall_' + packageName))).to.be(true);

            next();
        });

    });

    it('should not break anything when no hooks configured.', function (next) {

        upt.commands
        .uninstall([packageName], undefined, { cwd: tempDir })
        .on('end', function (installed) {

            //no exception then we're good

            next();
        });

    });

    it('should reorder packages by dependencies, while trying to maintain order from upt.json, correctly.', function () {

        var mockAngularUI = { dependencies: {
            'angular': '*'
        }};
        var mockJQuery = { dependencies: {
        }};
        var mockAngular = { dependencies: {
            'jquery': '*'
        }};
        var mockMoment = { dependencies: {
        }};
        var mockSelect2 = { dependencies: {
            'jquery': '*'
        }};
        var mockBadPackage = { dependencies: {
            'something-not-installed': '*'
        }};

        var packages = {
            'select2': mockSelect2,
            'angular-ui': mockAngularUI,
            'jquery': mockJQuery,
            'bad-package': mockBadPackage,
            'angular': mockAngular,
            'moment': mockMoment
        };
        var installed = [];
        var mockUptJson = { dependencies: {
            'jquery': '*',
            'select2': '*',
            'angular-ui': '*',
            'angular': '*',
            'moment': '*'
        } };

        var ordered = scripts._orderByDependencies(packages, installed, mockUptJson);
        expect(ordered).to.eql(['jquery', 'select2', 'angular', 'angular-ui', 'moment', 'bad-package']);

    });

    it('should process scripts with quotes and vars in the cmd properly.', function (next) {

        config.scripts.preinstall = 'touch "$UPT_PID %"';

        upt.commands
        .install([packageDir], undefined, config)
        .on('end', function (installed) {

            expect(fs.existsSync(path.join(tempDir, process.pid + ' ' + packageName))).to.be(true);

            next();
        });

    });

});