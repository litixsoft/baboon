exports = module.exports = function (basePath, callback) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var express = require('express'),
        http = require('http'),
        path = require('path'),
        fs = require('fs'),
        log = require('./logging'),
        config = require('./config')(path, fs, basePath, log),
        MongoStore = require('connect-mongo')(express),
        consolidate = require('consolidate'),
        handlebars = require('handlebars'),
        middleware = {},
        app = express(),
        server = http.createServer(app),
        io = require('socket.io').listen(server),
        mongoDb = require('mongoDb'),
        Db = mongoDb.Db,
        DbServer = mongoDb.Server,
        baboonDb = {};

    (function createBaboonDb() {
        log.debug('baboonDb setup');

        //noinspection JSUnresolvedVariable
        var dbServer = config.baboonDb.server,
            srv = {};

        //noinspection JSUnresolvedVariable
        if (dbServer.length > 1) {
            // replica set
            log.debug('use baboonDb replica set');

            var tmpServer = [],
                ReplSetServers = mongoDb.ReplSetServers,
                i = 0,
                max = dbServer.length,
                replSet;

            for (i, max; i < max; i += 1) {
                srv = dbServer[i];
                tmpServer.push(new DbServer(srv.host, srv.port, srv.options));
            }

            replSet = new ReplSetServers(tmpServer);

            //noinspection JSUnresolvedVariable
            baboonDb = new Db(config.baboonDb.dbName, replSet, config.baboonDb.dbOptions);
        }
        else {
            // single server
            log.debug('use baboonDb single server');
            //noinspection JSUnresolvedVariable
            srv = config.baboonDb.server[0];
            //noinspection JSUnresolvedVariable
            baboonDb = new Db(config.baboonDb.dbName, new DbServer(
                srv.host, srv.port, srv.options), config.baboonDb.dbOptions);
        }
    })();

    /**
     * server start function
     */
    function startServer() {
        //noinspection JSCheckFunctionSignatures
        server.listen(app.get('port'), function () {
            if (config.config !== 'base') {
                log.warn('application server has been started in ' + config.config + ' mode');
            }
            else {
                log.info('application server has been started in ' + config.config + ' mode');
            }

            log.info('application server listening on port ' + app.get('port'));
        });
    }

    baboonDb.open(function (err, db) {
        if (err) {
            throw new Error(err);
        }
        if (! db) {
            callback(new Error('Could not connect to the database'));
        }
        else {
            log.info('database baboon connected');

            (function configureApplication() {

                // middleware
                middleware = require('./middleware')(config);

                // view engine for application
                app.engine('html', consolidate.handlebars);

                // partial vars
                var stylesHtml, scriptsHtml, navigationHtml, sessionControlHtml;

                // register styles
                stylesHtml = path.join(config.partialPath, 'styles.html');
                //noinspection JSUnresolvedFunction
                handlebars.registerPartial('styles', fs.readFileSync(stylesHtml, 'utf8'));

                // register scripts
                scriptsHtml = path.join(config.partialPath, 'scripts.html');
                //noinspection JSUnresolvedFunction
                handlebars.registerPartial('scripts', fs.readFileSync(scriptsHtml, 'utf8'));

                // register navigation
                navigationHtml = path.join(config.partialPath, 'navigation.html');
                //noinspection JSUnresolvedFunction
                handlebars.registerPartial('navigation', fs.readFileSync(navigationHtml, 'utf8'));

                // register sessionControl
                sessionControlHtml = path.join(config.partialPath, 'sessionControl.html');
                //noinspection JSUnresolvedFunction
                handlebars.registerPartial('sessionControl', fs.readFileSync(sessionControlHtml, 'utf8'));

                function configExpressHandler() {
                    //noinspection JSUnresolvedVariable
                    app.set('port', config.port);
                    //noinspection JSUnresolvedVariable
                    app.set('views', config.basePath + '/views');
                    app.set('view engine', 'html');
                    //noinspection JSUnresolvedFunction
                    app.use(express.favicon());
                    //noinspection JSUnresolvedFunction
                    if (config.config === 'base') {
                        app.use(express.logger());
                    }
                    else {
                        app.use(express.logger('dev'));
                    }
                    //noinspection JSUnresolvedFunction
                    app.use(express.bodyParser());
                    //noinspection JSUnresolvedFunction
                    app.use(express.methodOverride());
                    // Static content before session middleware,
                    // prevents the session checking for static files in public.
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    app.use(express.static(config.publicPath));
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    app.use(express.cookieParser());

                    // Session has session cookie with expires:false.
                    // Session is only destroyed when the user closes the browser.
                    // Redis ttl is maximal lifetime of session, after this time session is destroyed
                    // Middleware checks the inactive period of the session by user.
                    // When this period is over, the session destroyed.
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    app.use(express.session({

                        key: config.sessionKey,
                        store: new MongoStore({
                            db: db
                        }),
                        secret: config.sessionSecret,
                        cookie: {expires: false}
                    }));
                    // Check session activity. Is session activity time over, session destroy and redirect /login.
                    app.use(middleware.auth.sessionActivity);
                    // Check if exists session. If not exists, setting guest.
                    app.use(middleware.auth.sessionExists);
                    // site context vars middleware
                    app.use(middleware.auth.siteContext);
                    // routing
                    app.use(app.router);
                    // middleware catch 404 error and send 404 error page
                    app.use(function (req, res) {
                        res.status(404);
                        res.render('404');
                    });
                    // error handling middleware
                    app.use(middleware.errorHandler);
                }

                //noinspection JSValidateTypes
                app.configure(configExpressHandler);
            })();

            callback(null, {
                express: {
                    app: app
                },
                middleware: {
                    auth: {
                        restricted: middleware.auth.restricted,
                        login: middleware.auth.login,
                        logout: middleware.auth.logout
                    }
                },
                server: {
                    start: startServer,
                    db: db,
                    io: io,
                    config: config
                }
            });
        }
    });
};