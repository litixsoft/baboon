'use strict';

var express = require('express');
var log4js = require('log4js');
var path = require('path');
var sessionstore = require('sessionstore');
var oneMonth = 2592000000;

/**
 * Config expressJs stack
 *
 * @param app
 * @param baboon
 */
module.exports = function(app, baboon) {

    var loggers = baboon.loggers;
    var config = baboon.config;
    var rootPath = config.path.root;

    // Development configuration
    app.configure('development', function () {
        // Enable livereload
        if (config.livereload) {
            app.use(require('connect-livereload')());
        }

        // Disable caching of scripts for easier testing
        app.use(function noCache(req, res, next) {

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
    });

    // Production configuration
    app.configure('production', function () {
        app.use(express.compress());

        // Disable caching for rest api
        app.use(function noCache(req, res, next) {

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
        app.use(express.favicon(path.join(rootPath, '.dist', 'public', 'favicon.ico'), {maxAge:oneMonth}));

        // Static path for files with cache
        app.use(express.static(path.join(rootPath, '.dist', 'public'), {maxAge:oneMonth}));

        // Static path for partial views without cache
        app.use(express.static(path.join(rootPath, '.dist', 'views', 'partials')));

        // Path for application views
        app.set('views', rootPath + '/.dist/views');
    });

    baboon.sessionStore = sessionstore.createSessionStore(config.session.stores[config.session.activeStore]);

    // Configuration for production and development
    app.configure(function () {
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(express.cookieParser('your secret here'));
        app.use(express.session({
            store: baboon.sessionStore,
            key: config.session.key,
            secret: config.session.secret,
            cookie: {expires: false}
        }));
        app.use('/api/', baboon.transport.processRequest);
        app.use(app.router);
        app.use(baboon.errorHandler);
    });
};
