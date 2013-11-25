'use strict';
var express = require('express');
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var log4js = require('log4js');
var redis = require('redis');
var lxHelpers = require('lx-helpers');
var RedisSessionStore = require('connect-redis')(express);

module.exports = function (rootPath) {
    var notice = clc.cyan;
    var middleware = {};
    var config = require('./config')(rootPath, notice);
    var logging = require('./logging')(config);
    var syslog = logging.syslog;
    var mail = require('./mail')(config);
    var rights = require('./rights')(config, logging);
    var app = express();
    var baboonErrors = require('./errors');

    ///////////////////////////////////////////
    // baboon
    ///////////////////////////////////////////

    var baboon = {
        middleware: middleware,
        config: config,
        rights: rights,
        logging: logging,
        mail: mail,
        server: {
            app: app
        }
    };

    // register Errors in baboon
    lxHelpers.forEach(baboonErrors, function (key, value) {
        baboon[key] = value;
    });

    var api = require(config.path.api)(baboon);

    ///////////////////////////////////////////
    // redis server
    ///////////////////////////////////////////
    var redisClient = redis.createClient(config.redis.server1.port, config.redis.server1.host);
    var sessionStore = new RedisSessionStore({
        client: redisClient,
        ttl: config.sessionMaxLife
    });
    var RedisSocketStore = require('socket.io/lib/stores/redis');
    var pub = redis.createClient(config.redis.server1.port, config.redis.server1.host);
    var sub = redis.createClient(config.redis.server1.port, config.redis.server1.host);

    redisClient.on('error', function (err) {
        var msg = 'error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err;

        syslog.error(msg);
        throw new Error(msg);
    });

    ///////////////////////////////////////////
    // config server
    ///////////////////////////////////////////

    // set log level for syslog logger
    syslog.setLevel(config.logging.syslog);

    // set log level for syslog logger
    logging.audit.setLevel(config.logging.audit);

    var server;

    // setup server to https or http from config protocol
    if (config.protocol === 'https') {
        var https = require('https'),
            serverOptions = {
                key: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.key')),
                cert: fs.readFileSync(path.join(rootPath, 'server', 'ssl', 'ssl.crt'))
            };

        server = https.createServer(serverOptions, app);
    } else if (config.protocol === 'http') {
        var http = require('http');

        server = http.createServer(app);
    } else {
        var msg = 'error server config - missing or wrong protocol' + config.protocol;

        syslog.error(msg);
        throw new Error(msg);
    }

    var io = require('socket.io').listen(server);
    baboon.server.sio = io;

    ///////////////////////////////////////////
    // Middleware
    ///////////////////////////////////////////

    middleware.errorHandler = require('./middleware/errorHandler')(syslog);
    middleware.session = require('./middleware/session')(baboon);
    middleware.nav = require('./middleware/nav')(baboon);
    middleware.auth = require('./middleware/auth')(baboon);

    ///////////////////////////////////////////
    // start server
    ///////////////////////////////////////////

    baboon.server.start = function () {
        var startOn = 'application server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port,
            startMode = 'application server has been started in ' + config.node_env + ' mode';

        server.listen(app.get('port'), function () {
            syslog.info(startOn);

            if (config.node_env !== 'production') {
                syslog.warn(startMode);
            } else {
                syslog.info(startMode);
                console.log(
                    notice('   info  - ') + startOn + '\n' +
                        notice('   info  - ') + startMode + '\n' +
                        notice('   info  - ') + 'write all entries to logfile...');
            }
        });
    };

    ///////////////////////////////////////////
    // View Engine EJS
    ///////////////////////////////////////////

    // view engine for application
    app.engine('.html', require('ejs').__express);

    ///////////////////////////////////////////
    // Init all app controllers
    ///////////////////////////////////////////

    var controllers = api.initAppControllers();

    ///////////////////////////////////////////
    // Express
    ///////////////////////////////////////////

    // express default config
    var expressConfig = function () {
        app.set('port', config.port);
        app.set('views', config.path.dist + '/app');
        app.set('view engine', 'html');

        // set log level for syslog logger
        logging.express.setLevel(config.logging.express);

        // logging
        if (config.node_env === 'production') {
            app.use(log4js.connectLogger(logging.express, {level: 'auto'}));
        } else {
            app.use(log4js.connectLogger(logging.express, {level: 'auto', format: ':status :method :url'}));
        }

        app.use(express.favicon(config.path.public + '/favicon.ico'));
        app.use(express.compress());
        app.use(express.static(config.path.public));
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(express.cookieParser());

        // Session has session cookie with expires:false.
        // Session is only destroyed when the user closes the browser.
        // Redis ttl is maximal lifetime of session, after this time session is destroyed
        // Middleware checks the inactive period of the session by user.
        // When this period is over, the session destroyed.
        app.use(express.session({
            key: config.sessionKey,
            store: sessionStore,
            secret: config.sessionSecret,
            cookie: {expires: false}
        }));

        // routing
        app.use(app.router);

        // restricted api
        app.use('/api/v1', middleware.auth.restrictedApi);

        // Catch all other rest api requests and forward to controller
        app.use('/api/v1', function (req, res) {
            // remove trailing slash
            var route = req.url.substring(1);
            var parsedRoute = api.parseRoute(route);

            // check if user has access to route
            if (rights.userHasAccessTo(req.session.user, route)) {
                var data = req.body;

                // create request object for controller
                var request = {
                    /**
                     * Returns the current session.
                     *
                     * @param {!function(error, result)} callback The callback.
                     */
                    getSession: function (callback) {
                        callback(null, req.session);
                    },
                    /**
                     * Sets the session.
                     *
                     * @param {!Object} session The session object.
                     * @param {function(error, result)=} callback The callback.
                     */
                    setSession: function (session, callback) {
                        if (!lxHelpers.isObject(session)) {
                            var error = lxHelpers.getTypeError('session', session, {});
                            syslog.error(error);

                            if (callback) {
                                callback(error);
                            }

                            return;
                        }

                        if (callback) {
                            callback(null, true);
                        }
                    }
                };

                if (controllers[parsedRoute.controllerFullPath]) {
                    controllers[parsedRoute.controllerFullPath][parsedRoute.action](data, request, function (error, result) {
                        res.send({error: api.parseError(error, data), data: result});
                    });
                } else {
                    res.json(403, 'Wrong url');
                }
            } else {
                res.json(403, 'Access denied.');
            }
        });

        // restricted route
        app.use(middleware.auth.restrictedRoute);

        // catch all unresolved routes
        app.use(function (req, res) {
            middleware.session.checkSession(req, res, function () {
                middleware.nav.setNavData(req);
                res.render('index');
            });
        });
    };

    // express production config
    var expressProductionConfig = function () {
        // error handling middleware
        app.use(middleware.errorHandler.productionHandler);
    };

    // express development config
    var expressDevelopmentConfig = function () {
        // error handling middleware
        app.use(middleware.errorHandler.developmentHandler);
    };

    // express configure
    app.configure(expressConfig);
    app.configure('development', expressDevelopmentConfig);
    app.configure('production', expressProductionConfig);

    ///////////////////////////////////////////
    // default routes
    ///////////////////////////////////////////

    if (config.useRightsSystem === true) {

        // login middleware rest api
        app.post('/api/v1/auth/login', middleware.auth.login);

        // login extra login page app
        if (config.useRightsSystem && config.extraLoginPage) {
            app.get('/login', function (req, res) {
                middleware.session.checkSession(req, res, function () {
                    res.render('auth/index');
                });
            });
        }

        // logout middleware route
        app.get('/auth/logout', middleware.auth.logout);
    }

    // rest public api outside rights system.
    app.post('/api/v1/session/setActivity', middleware.session.setActivity);
    app.post('/api/v1/session/getLastActivity', middleware.session.getLastActivity);
    app.post('/api/v1/session/getData', middleware.session.getData);
    app.post('/api/v1/session/setData', middleware.session.setData);
    app.post('/api/v1/session/deleteData', middleware.session.deleteData);
    app.post('/api/v1/auth/getAuthData', middleware.auth.getAuthData);
    app.post('/api/v1/auth/activateUser', middleware.auth.activateUser);
    app.post('/api/v1/nav/getNavData', middleware.nav.getNavData);

    app.get('/*/*.md', function (req, res) {

        var mdPath = path.join(rootPath, 'client', 'app', req.url);
        fs.readFile(mdPath, 'utf8', function (err, data) {
            if (err) {
                res.json(200, { markdown: err});
            }
            res.json(200, { markdown: data});
        });
    });

    ///////////////////////////////////////////
    // Socket.IO
    ///////////////////////////////////////////

    // set log level for socket logger
    logging.socket.setLevel(config.logging.socket);

    // default config
    io.configure(function () {
        // set socket.io redis store
        io.set('store', new RedisSocketStore({
            redisPub: pub,
            redisSub: sub,
            redisClient: redisClient
        }));

        // Transport
        io.set('transports',
            [
                'websocket'
                //'htmlfile',
                //'xhr-polling',
                //'jsonp-polling'
            ]
        );

        io.set('authorization', function (data, callback) {
            // check if cookie exists
            if (!data.headers.cookie) {
                callback(null, false);
            } else {
                // parse cookie in sessionId
                var signedCookies = require('express/node_modules/cookie').parse(data.headers.cookie),
                    sessionId = require('express/node_modules/connect/lib/utils')
                        .parseSignedCookies(signedCookies, config.sessionSecret)['baboon.sid'];

                // get session from redis session store
                sessionStore.get(sessionId, function (err, session) {
                    if (err || !session) {
                        callback(null, false);
                    } else {

                        var isAuth = true;

                        // restricted socket connection when extraLoginPage is enabled
                        if (config.useRightsSystem && config.extraLoginPage) {
                            isAuth = session.user && session.user.id !== -1;
                        }

                        if (isAuth) {
                            data.session = session;
                            data.session.sessionID = sessionId;
                            callback(null, true);
                        }
                        else {
                            callback(null, false);
                        }
                    }
                });
            }
        });
    });

    // production config
    io.configure('production', function () {
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        io.set('logger', logging.socket);
    });

    // development config
    io.configure('development', function () {
        io.set('logger', logging.socket);
    });

    // socket connection event
    io.sockets.on('connection', function (socket) {
        var session = socket.handshake.session,
            sessionId = session.sessionID;

        // save socketId in session
        session.socketID = socket.id;

        syslog.info('socket: client connected');
        syslog.info('socket: {socketId: %s, username: %s, sessionID: %s }', socket.id, ((session.user || {}).username || 'no user'), session.sessionID);

        socket.on('disconnect', function () {
            syslog.info('socket: %s disconnected', socket.id);
        });

        // register socket events based on user acl
        rights.getAclObj((session.user || {}).acl, function (error, result) {
            if (error) {
                syslog.error('rights: Error loading acl for user %s (%s)', (session.user || {}).username, (session.user || {})._id);
                return;
            }

            // create request object for controller
            var request = {
                /**
                 * Returns the current session.
                 *
                 * @param {!function(error, result)} callback The callback.
                 */
                getSession: function (callback) {
                    // get session from redis session store
                    sessionStore.get(session.sessionID, callback);
                },
                /**
                 * Sets the session.
                 *
                 * @param {!Object} session The session object.
                 * @param {function(error, result)=} callback The callback.
                 */
                setSession: function (session, callback) {
                    if (!lxHelpers.isObject(session)) {
                        var error = lxHelpers.getTypeError('session', session, {});
                        syslog.error(error);

                        if (callback) {
                            callback(error);
                        }

                        return;
                    }

                    sessionStore.set(sessionId, session, callback);
                }
            };

            api.registerSocketEvents(socket, result, controllers, request);
        });
    });

    return baboon;
};