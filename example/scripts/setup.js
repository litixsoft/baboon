'use strict';

var grunt = require('grunt'),
    path = require('path'),
    rootPath = path.resolve(),
    config = require('../../lib/config.js')(rootPath),
    logging = require('../../lib/logging.js')(
        config.path.logs, config.nodeEnv, config.logging.maxLogSize, config.logging.backups),
    rights = require('../../lib/rights')(config, logging);

grunt.log.ok('Start setup script for baboon example app.');

function finalCallback (error) {
    if (error) {
        grunt.log.error(error);
        process.exit(1);
    }

    grunt.log.ok('Setup was successfully.');
    process.exit(0);
}

// create default system users
rights.ensureThatDefaultSystemUsersExists(function (error) {
    if (error) {
        finalCallback(error);
        return;
    }

    grunt.log.ok('rights: All system users are there.');

    if (config.useRightsSystem) {
        // create/refresh rights in db
        rights.refreshRightsIdDb(function (error) {
            if (error) {
                finalCallback(error);
                return;
            }

            grunt.log.ok('rights: All rights are stored in db.');

            finalCallback();
        });
    } else {
        finalCallback();
    }
});