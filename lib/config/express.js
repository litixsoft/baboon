'use strict';

var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');
var log4js = require('log4js');
var path = require('path');
var oneMonth = 2592000000;

/**
 * Config expressJs stack
 *
 * @param {!Object} app
 * @param {Array.<string>} routes
 * @param {!Object} baboon
 * @return {Object}
 */
module.exports = function (app, routes, baboon) {

    var loggers = baboon.loggers;
    var config = baboon.config;
    var rootPath = config.path.root;

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    if (app.get('env') === 'development') {

        // Disable caching of scripts for easier testing
        app.use(function noCache (req, res, next) {

            if (req.url.indexOf('/app/') === 0 || req.url.indexOf('/common/') === 0 ||
                req.url.indexOf('/api/') === 0 || req.url.indexOf('/assets/') === 0) {

                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        // Logger in development mode
        app.use(log4js.connectLogger(loggers.express, {level: 'auto', format: ':status :method :url'}));

        // Static path for files and partial views
        app.use(express.static(path.join(rootPath, '.tmp')));
        app.use(express.static(path.join(rootPath, 'client')));

        // Path for application views
        app.set('views', rootPath + '/.tmp/views');
    }
    else if (app.get('env') === 'production') {

        // Enable compress
        app.use(compress());

        // Disable caching for rest api
        app.use(function noCache (req, res, next) {

            if (req.url.indexOf('/api/') === 0) {
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        // Logger in production mode
        app.use(log4js.connectLogger(loggers.express, {level: 'auto'}));

        // Path for favicon with cache
        //app.use(express.favicon(path.join(rootPath, '.dist', 'public', 'favicon.ico'), {maxAge:oneMonth}));

        // Static path for files with cache
        app.use(express.static(path.join(rootPath, '.dist', 'public'), {maxAge: oneMonth}));

        // Static path for partial views without cache
        app.use(express.static(path.join(rootPath, '.dist', 'views', 'partials')));

        // Path for application views
        app.set('views', rootPath + '/.dist/views');
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(session({
        store: baboon.session.getSessionStore(),
        key: config.session.key,
        secret: config.session.secret,
        cookie: {expires: false},
        resave: false,
        saveUninitialized: true
    }));

    // Enable livereload
    if (app.get('env') === 'development' && config.livereload) {
        app.use(require('connect-livereload')());
    }

    app.use('/account/activate/:token', baboon.middleware.account.activate);
    app.use(baboon.middleware.session.initSession);
    app.use('/api/auth/login', baboon.middleware.auth.login);
    app.use('/api/auth/logout', baboon.middleware.auth.logout);
    app.use('/api/', baboon.transport.processRequest);
    app.use(baboon.middleware.session.checkActivitySession);
    app.use('/', routes);
    app.use(baboon.errorHandler);

    // Overwrite express app listen
    app.listen = function () {
        var server = baboon.getServer(app);
        return server.listen.apply(server, arguments);
    };
};
