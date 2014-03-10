'use strict';
var path = require('path'),
    grunt = require('grunt'),
    lxHelpers = require('lx-helpers'),
    rootPath = path.resolve('..', 'baboon', 'example'),
    config = require('../../lib/config.js')(rootPath),
    configFile = require(path.join(rootPath, 'config', 'app.conf.json'));

// override mongo connection strings
config.mongo.rights = configFile.params.unitTest.mongo.rights;
config.mongo.logs = configFile.params.unitTest.mongo.logs;

// override path to settings
config.path.settings = path.join(path.resolve('..', 'baboon'), 'build', 'tmp', 'settings');
config.path.appFolder = path.join(path.resolve('..', 'baboon'), 'build', 'tmp');

grunt.file.mkdir(config.path.settings);

// set useRightsSystem to true to make rights tests runs
config.useRightsSystem = true;

module.exports = function () {
    var logging = function (msg) {
        console.log(msg);
    };

    var syslog = {
        debug: logging,
        info: logging,
        warn: logging,
        error: logging,
        fatal: logging
    };

    return {
        logging: {
            syslog: lxHelpers.clone(syslog),
            audit: lxHelpers.clone(syslog)
        },
        config: lxHelpers.clone(config)
    };
};