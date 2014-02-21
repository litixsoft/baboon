'use strict';

var fs = require('fs');
var path = require('path');
var clc = require('cli-color');

module.exports = function (app, baboon) {

    var rootPath = baboon.config.path.root;

    /**
     * Get http or https server
     *
     * @param app
     * @returns {{}}
     */
    var getServer = function(app) {

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
            var msg = 'error server config - missing or wrong protocol' + baboon.config.protocol;
            baboon.loggers.syslog.error(msg);
            throw new Error(msg);
        }

        return server;
    };

    /**
     * Start server and listen on port
     *
     * @param app
     */
    var listenServer = function(app) {
        var server = getServer(app);
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

    return {
        getServer:getServer,
        listenServer:listenServer
    };
};
