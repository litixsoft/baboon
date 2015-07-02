'use strict';

var express = require('express');
var chalk = require('chalk');
var rootPath = __dirname;
var baboon = require('../lib/baboon')(rootPath);
var routes = require('../lib/routes')(baboon);

// Express
var app = express();

// Express configuration
require('../lib/config/express')(app, routes, baboon);

var server;

/**
 * Gets called after the server is successfully started
 */
function serverStartedCallback () {
    var config = baboon.config;
    var startOn = 'server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port;
    var startMode = 'server has been started in ' + config.node_env + ' mode';

    baboon.loggers.syslog.info(startOn);
    baboon.loggers.syslog.debug(startMode);

    if (config.logging.loggers.syslog.appender !== 'console') {
        console.log(chalk.cyan('   info  - ') + startOn);
    }

    // Socket.Io server
    var io = require('socket.io').listen(server);

    // Socket.Io configuration
    require('../lib/config/socket-io')(io, baboon);
}

/**
 * Start the web server
 */
function startServer () {
    server = baboon.appListen(app, serverStartedCallback);

    server.on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            baboon.loggers.syslog.warn('Port ' + baboon.config.port + ' is already in use');
            baboon.config.port++;

            // try to start server again with other port
            startServer();
        } else {
            throw e;
        }
    });
}

// start the server
startServer();

// Expose app
module.exports = app;
