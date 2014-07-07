'use strict';

var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var stdio = require('stdio');
var navigation = require('./navigation');
var navigationFilePath;
var account = require('./account');

// Middleware
var errorHandler = require('./middleware/errorHandler');
var middlewareSession = require('./middleware/session');
var middlewareAuth = require('./middleware/auth');
var middlewareAccount = require('./middleware/account');

/**
 * Baboon
 * The core module from baboon
 *
 * @param {String} rootPath The root path of the application
 * @returns {Object}
 */
module.exports = function (rootPath) {

    // Set command line arguments
    var argv = stdio.getopt({
        'config': {key: 'c', args:1, description: 'Use the specified config section'},
        'port': {args:1, description: 'Use the specified port'},
        'protocol': {args:1, description: 'Use the specified protocol'},
        'livereload': {description: 'Use livereload snippet for client'}
    });

    // Baboon core
    var baboon = {};

    // Errors
    baboon.ValidationError = require('./errors').ValidationError;
    baboon.ControllerError = require('./errors').ControllerError;

    // Config
    baboon.config = require('./config')(rootPath, argv);

    // Loggers
    baboon.loggers = require('./logging')(baboon.config);

    // Crypto
    baboon.crypto = require('./crypto')();

    // Rights
    baboon.rights = require('./rights')(baboon.config, baboon.loggers);

    // Session
    baboon.session = require('./session')(baboon);

    // Settings
    baboon.settings = require('./settings')(baboon);

    // Transport
    baboon.transport = require('./transport')(baboon);

    // Middleware
    baboon.middleware = {};

    // Middleware session
    baboon.middleware.session = middlewareSession(baboon);

    // Middleware auth
    baboon.middleware.auth = middlewareAuth(baboon);

    // Middleware account
    baboon.middleware.account = middlewareAccount(baboon);

    // ErrorHandler
    baboon.errorHandler = errorHandler(baboon.config, baboon.loggers.syslog).errorHandler;

    // Navigation
    navigationFilePath = path.resolve(path.join(rootPath,'.dist','navigation'));
    baboon.navigation = navigation(navigationFilePath, baboon.rights);

    // Add navigation to transport
    baboon.transport.addController(baboon.navigation, 'navigation');

    // Add session to transport
    baboon.transport.addController(baboon.session, 'session');

    // Add settings to transport
    baboon.transport.addController(baboon.settings, 'settings');

    // Add account to transport
    baboon.transport.addController(account(baboon.config, baboon.loggers), 'account');

    /**
     * Get http or https server
     *
     * @param {Object} app The application object
     * @return {Object} Returns the server object
     */
    baboon.getServer = function(app) {

        var server = {};

        // setup server to https or http from config protocol
        if (baboon.config.protocol === 'https') {
            var https = require('https'),
                serverOptions = {
                    key: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.key')),
                    cert: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.crt'))
                };

            server = https.createServer(serverOptions, app);
        }
        else if (baboon.config.protocol === 'http') {
            var http = require('http');
            server = http.createServer(app);
        } else {
            var msg = 'error server config - missing or wrong protocol: ' + baboon.config.protocol;
            baboon.loggers.syslog.error(msg);
            throw new Error(msg);
        }

        return server;
    };

    /**
     * App listen on port
     *
     * @param {Object} app The express app object
     */
    baboon.appListen = function(app) {
        var config = baboon.config;
        var startOn = 'server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port;
        var startMode = 'server has been started in ' + config.node_env + ' mode';
        var syslog = baboon.loggers.syslog;

        return app.listen(config.port, config.host, function () {
            syslog.info(startOn);
            syslog.debug(startMode);

            if (config.logging.loggers.syslog.appender !== 'console') {
                console.log(clc.cyan('   info  - ') + startOn);
            }
        });
    };

    return baboon;
};