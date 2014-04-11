'use strict';

var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var stdio = require('stdio');
var navigation = require('./navigation');
var navigationFilePath;

// Middleware
var errorHandler = require('./middleware/errorHandler');
var middlewareSession = require('./middleware/session');

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

    // Config
    baboon.config = require('./config')(rootPath, argv);

    // Loggers
    baboon.loggers = require('./logging')(baboon.config);

    // Session
    baboon.session = require('./session')(baboon.config.session, baboon.loggers.syslog);

    // Transport
    baboon.transport = require('./transport')(baboon);

    // Rights
    baboon.rights = require('./rights')(baboon.config, baboon.loggers);

    // Middleware
    baboon.middleware = {};

    // Middleware session
    baboon.middleware.session = middlewareSession(baboon);

    // ErrorHandler
    baboon.errorHandler = errorHandler(baboon.config, baboon.loggers.syslog).errorHandler;

    // Navigation
    navigationFilePath = path.resolve(path.join(rootPath,'.dist','navigation'));
    baboon.navigation = navigation(navigationFilePath);

    // Add navigation to transport
    baboon.transport.addController(baboon.navigation, 'navigation');

    // Add session to transport
    baboon.transport.addController(baboon.session, 'session');

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
                    key: fs.readFileSync(path.join(rootPath, 'ssl', 'ssl.key')),
                    cert: fs.readFileSync(path.join(rootPath, 'ssl', 'ssl.crt'))
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
     * Start server and listen on port
     *
     * @param {Object} server The server object
     */
    baboon.serverListen = function(server) {
        var config = baboon.config;
        var startOn = 'server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port;
        var startMode = 'server has been started in ' + config.node_env + ' mode';
        var syslog = baboon.loggers.syslog;

        server.listen(config.port, config.host, function () {
            syslog.info(startOn);
            syslog.debug(startMode);

            if (config.logging.loggers.syslog.appender !== 'console') {
                console.log(clc.cyan('   info  - ') + startOn);
            }
        });
    };

    return baboon;
};