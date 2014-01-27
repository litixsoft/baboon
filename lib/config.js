'use strict';
var path = require('path');
var ConfigError = require('./errors').ConfigError;

/**
 * Setup baboon-server config
 *
 * @param rootPath
 * @param argv
 * @returns {base|*|base|base|base|base}
 */
module.exports = function (rootPath, argv) {

    // Check parameters.
    if (arguments.length < 2) {
        throw new ConfigError('Parameter missing, rootPath and argv are required!');
    }

    if (typeof rootPath !== 'string') {
        throw new ConfigError('Parameter rootPath must be a string type!');
    }

    if (typeof argv !== 'object') {
        throw new ConfigError('Parameter rootPath must be a string type!');
    }

    // Config settings
    var settings = require(path.join(rootPath, 'config'))();

    // Set default value for config section.
    var section = 'production';

    // Check config option and set the section.
    if (argv.config && settings[argv.config]) {

        // Set the config value.
        section = argv.config;
    }

    // Load the config.
    var config = settings[section]();

    // Set NODE_ENV environment.
    process.env.NODE_ENV = config.node_env;

    // Check port argv
    if (argv.port) {
        config.port = argv.port;
    }

    // Check protocol argv
    if (argv.protocol) {
        config.protocol = argv.protocol;
    }

    // Check livereload argv
    if (argv.livereload) {
        config.livereload = true;
    }

    // Extend config with paths.
    config.path = {};
    config.path.root = rootPath;
    config.path.logs = path.join(rootPath, 'server', 'logs');

    // Extend config with argv.
    config.argv = argv;

    return config;
};