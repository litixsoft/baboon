'use strict';

var configParam = process.argv[2] || 'production';
var config = require('../../lib/config')(require('path').join(__dirname, '../'), {config: configParam});
var loggers = require('../../lib/logging')(config);
var rights = require('../../lib/rights.js')(config, loggers);
var grunt = require('grunt');

grunt.log.ok('Start setup script for baboon example app.');
grunt.log.ok('Used config: ' + configParam);
grunt.log.ok('config.rights.enabled: ' + config.rights.enabled);

rights.ensureThatDefaultSystemUsersExists(function () {
    rights.refreshRightsIdDb(function (error) {
        if (error) {
            grunt.log.error(error);
            process.exit(1);
        }

        grunt.log.ok('Setup was successfully.');
        process.exit(0);
    });
});