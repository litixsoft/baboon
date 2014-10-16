'use strict';

var constants = require('constants');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
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
module.exports = function (rootPath, options) {
    options = options || {};

    // Set command line arguments
    var argv = stdio.getopt({
        'config': {key: 'c', args: 1, description: 'Use the specified config section'},
        'port': {args: 1, description: 'Use the specified port'},
        'protocol': {args: 1, description: 'Use the specified protocol'},
        'livereload': {description: 'Use livereload snippet for client'}
    });

    // Baboon core
    var baboon = {};

    // Errors
    baboon.AccountError = require('./errors').AccountError;
    baboon.AuthError = require('./errors').AuthError;
    baboon.ControllerError = require('./errors').ControllerError;
    baboon.ValidationError = require('./errors').ValidationError;

    // root path
    baboon.rootPath = rootPath;

    // Config
    baboon.config = require('./config')(rootPath, argv);

    // Loggers
    baboon.loggers = options.loggers || require('./logging')(baboon.config);

    // Crypto
    baboon.crypto = options.crypto || require('./crypto')();

    // Rights
    baboon.rights = require('./rights')(baboon);

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

    if (baboon.config.rights.enabled) {
        // Middleware account
        baboon.middleware.account = middlewareAccount(baboon);
    }

    // ErrorHandler
    baboon.errorHandler = errorHandler(baboon.config, baboon.loggers.syslog).errorHandler;

    // Navigation
    navigationFilePath = path.resolve(path.join(rootPath, '.dist', 'navigation'));
    baboon.navigation = navigation(navigationFilePath, baboon.rights);

    // Add navigation to transport
    baboon.transport.addController(baboon.navigation, 'navigation');

    // Add session to transport
    baboon.transport.addController(baboon.session, 'session');

    // Add settings to transport
    baboon.transport.addController(baboon.settings, 'settings');

    if (baboon.config.rights.enabled) {
        // Add account to transport
        baboon.transport.addController(account(baboon), 'account');
    }

    /**
     * Get http or https server
     *
     * @param {Object} app The application object
     * @return {Object} Returns the server object
     */
    baboon.getServer = function (app) {

        var server = {};

        // setup server to https or http from config protocol
        if (baboon.config.protocol === 'https') {
            var https = require('https'),
                serverOptions = {
                    key: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.key')),
                    cert: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.crt')),

                    // https://gist.github.com/3rd-Eden/715522f6950044da45d8

                    // This is the default secureProtocol used by Node.js, but it might be
                    // sane to specify this by default as it's required if you want to
                    // remove supported protocols from the list. This protocol supports:
                    //
                    // - SSLv2, SSLv3, TLSv1, TLSv1.1 and TLSv1.2
                    //
                    secureProtocol: 'SSLv23_method',

                    //
                    // Supply `SSL_OP_NO_SSLv3` constant as secureOption to disable SSLv3
                    // from the list of supported protocols that SSLv23_method supports.
                    //
                    secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_SSLv2
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
    baboon.appListen = function (app) {
        var config = baboon.config;
        var startOn = 'server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port;
        var startMode = 'server has been started in ' + config.node_env + ' mode';
        var syslog = baboon.loggers.syslog;

        return app.listen(config.port, config.host, function () {
            syslog.info(startOn);
            syslog.debug(startMode);

            if (config.logging.loggers.syslog.appender !== 'console') {
                console.log(chalk.cyan('   info  - ') + startOn);
            }
        });
    };

    return baboon;
};