'use strict';

var path = require('path');
var fs = require('fs');
var os = require('os');
var ConfigError = require('./errors').ConfigError;

/**
 * Setup baboon-server config
 *
 * @param {String} rootPath The root path to the application
 * @param {Object} argv The arguments of the application
 * @return {Object} Returns the config object
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
        throw new ConfigError('Parameter argv must be of type object!');
    }

    function ensureFolderExists (path) {
        if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
            // create it
            fs.mkdirSync(path);
        }
    }

    // Config settings
    var settings = require(path.join(rootPath, 'config'))();

    // creates directory if not exists
    function checkDirectory(basedir) {
        var pathArr = basedir.split(path.sep).reverse();
        var pathStr = '';
        var buffer;

        try {
            while (pathArr.length > 0) {
                pathStr += pathArr.pop() + path.sep;

                // check if every directory exists
                ensureFolderExists(pathStr);
            }

            // check if application can write file in directory
            buffer = fs.openSync(pathStr + 'tmp.tmp', 'w+');
            fs.closeSync(buffer);
            fs.unlinkSync(pathStr + 'tmp.tmp');
        }
        catch (error) {
            // use user direcotry
            pathStr = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.baboon');

            try {
                // check if application can write file in directory
                buffer = fs.openSync(pathStr + 'tmp.tmp', 'w+');
                fs.closeSync(buffer);
                fs.unlinkSync(pathStr + 'tmp.tmp');

                console.log('Switched path where app files are written from \'%s\' to \'%s\'', basedir, pathStr);
            }
            catch (error) {
                // use tmp directory if user has no user directory
                pathStr = os.tmpdir();

                console.log('Switched path where app files are written from \'%s\' to \'%s\'', basedir, pathStr);
            }
        }

        return pathStr;
    }

    var rootDir,
        logDir,
        dbDir;

    rootDir = checkDirectory(path.join(rootPath, settings.filesPath));
    ensureFolderExists(rootDir);
    settings.filesPath = rootDir;

    logDir = path.join(rootDir, 'logs');
    ensureFolderExists(logDir);

    dbDir = path.join(rootDir, 'db');
    ensureFolderExists(dbDir);

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
    config.path.logs = logDir;
    config.path.modules = path.join(rootPath, 'server', 'modules');
    config.path.appFolder = rootDir;

    // Extend config with argv.
    config.argv = argv;

    return config;
};