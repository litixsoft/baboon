'use strict';

var errorHandler = require('./middleware/errorHandler');
var navigation = require('./middleware/navigation');
var navigationFilePath;
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');

/**
 * Baboon
 * The core module from baboon
 *
 * @param {string} rootPath - The root path of application
 * @returns {{}}
 */
module.exports = function (rootPath, argv) {

    // Baboon core
    var baboon = {};
    baboon.config = require('./config')(rootPath, argv);
    baboon.loggers = require('./logging')(baboon.config);
    baboon.transport = require(baboon.config.path.transport)(baboon);

    /**
     * Get http or https server
     *
     * @param app
     * @returns {{}}
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
     * @param app
     * @returns {{}}
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

    // Middleware

    // ErrorHandler
    baboon.errorHandler = errorHandler(baboon.loggers.syslog).errorHandler;

    // Navigation
    navigationFilePath = path.resolve(path.join(rootPath,'.dist','navigation'));
    baboon.navigation = navigation(navigationFilePath);

    baboon.transport.addController(baboon.navigation, 'navigation');

    return baboon;
};