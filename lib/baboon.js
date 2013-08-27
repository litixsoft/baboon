'use strict';

module.exports = function (rootPath) {
    var express = require('express'),
        path = require('path'),
        fs = require('fs'),
        clc = require('cli-color'),
        notice = clc.cyan,
        config = require('./config')(rootPath, notice),
        log4js = require('log4js'),
        logging = require('./logging')(
            config.path.logs, config.nodeEnv, config.logging.maxLogSize, config.logging.backups),
        syslog = logging.syslog,
        audit = logging.audit,
        expressLog = logging.express,
        socketLog = logging.socket,
        redis = require('redis'),
        redisClient = redis.createClient(config.redis.server1.port, config.redis.server1.port),
        RedisSessionStore = require('connect-redis')(express),
        sessionStore = new RedisSessionStore({
            client: redisClient,
            ttl: config.sessionMaxLife
        }),
        middleware = {},
        app = express(),
        api = require(config.path.api),
        rights = require('./rights')(config, logging),
        RedisSocketStore = require('socket.io/lib/stores/redis'),
        pub = redis.createClient(config.redis.server1.port, config.redis.server1.port),
        sub = redis.createClient(config.redis.server1.port, config.redis.server1.port);

    ///////////////////////////////////////////
    // config server
    ///////////////////////////////////////////

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

    ///////////////////////////////////////////
    // check redis Db
    ///////////////////////////////////////////

    redisClient.on('error', function (err) {
        var msg = 'error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err;

        syslog.error(msg);
        throw new Error(msg);
    });

    ///////////////////////////////////////////
    // Middleware
    ///////////////////////////////////////////

    middleware.errorHandler = require('./middleware/errorHandler')(syslog);
//    middleware.auth = require('./middleware/auth')(rights, config);
    middleware.session = require('./middleware/session')(rights, config);
    middleware.context = require('./middleware/context')(rights, config);

    if (config.useRightsSystem === true) {
        middleware.auth = require('./middleware/auth')(rights, config);
    }

    ///////////////////////////////////////////
    // start server
    ///////////////////////////////////////////

    var startServer = function () {
        var startOn = 'application server has been started on: ' + config.protocol + '://' + config.host + ':' + config.port,
            startMode = 'application server has been started in ' + config.nodeEnv + ' mode';

        server.listen(app.get('port'), function () {
            syslog.info(startOn);

            if (config.nodeEnv !== 'production') {
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
    // Express
    ///////////////////////////////////////////

//    var passport = require('passport'),
//        pwd = require('pwd'),
//        LocalStrategy = require('passport-local').Strategy;

    // express default config
    var expressConfig = function () {
        app.set('port', config.port);
        app.set('views', config.path.dist + '/views');
        app.set('view engine', 'html');

        // logging
        if (config.nodeEnv === 'production') {
            app.use(log4js.connectLogger(expressLog, {level: log4js.levels[config.logging.express]}));
        } else {
            app.use(express.logger('dev'));
        }

        app.use(express.favicon());
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        // Static content before session middleware,
        // prevents the session checking for static files in public.
        app.use(express.static(config.path.public));
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

//        // passport stuff
//        passport.serializeUser(function (user, done) {
//            done(null, user.id);
//        });
//
//        passport.deserializeUser(function (id, done) {
//            findById(id, function (err, user) {
//                done(err, user);
//            });
//        });
//
//        passport.use(new LocalStrategy(
//            function (username, password, done) {
//                // asynchronous verification, for effect...
//                process.nextTick(function () {
//
//                    rights.data().getUserForLogin(username, function (error, user) {
//                        if (!user) {
//                            done(null, false, { message: 'Unknown user ' + username });
//                        } else {
//                            // apply the same algorithm to the POSTed password, applying
//                            // the hash against the pass / salt, if there is a match we
//                            // found the user
//                            pwd.hash(password, user.salt, function (error, hash) {
//                                // todo remove later
//                                if ((hash && hash.toString() === user.hash.toString()) || name === 'sysadmin') {
//                                    // load complete user data
//                                    rights.data().getUser(user._id, function (error, result) {
//                                        done(null, result);
//                                    });
//                                } else {
//                                    done(null, false, { message: 'Invalid password' });
//                                }
//                            });
//                        }
//                    });
//                });
//            }
//        ));
//
//        app.use(passport.initialize());
//        app.use(passport.session());

        // routing
        app.use(app.router);

        // catch all unresolved routes
        app.use(function (req, res) {
            middleware.session.checkSession(req, res, function () {
                middleware.context.index(req, res);
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
        // login middleware
        app.post('/login', middleware.auth.login);

        // logout middleware
        app.get('/logout', middleware.auth.logout);
    }

//    // login middleware
//    app.post('/login', middleware.auth.login);

//    app.post('/login',
//        passport.authenticate('local', { failureRedirect: '/login' }),
//        function (req, res) {
//            res.redirect('/');
//        });

    // session api
    app.post('/api/session/setActivity', middleware.session.setActivity);
    app.post('/api/session/getData', middleware.session.getData);
    app.post('/api/session/setData', middleware.session.setData);

//    // logout middleware
//    app.get('/logout', middleware.auth.logout);

//    app.get('/logout', function(req, res){
//        req.logout();
//        res.redirect('/');
//    });

    // catch all html view files
    app.get('/*/*.html', function (req, res) {
        if (req.url === '/login/login.html') {
            middleware.context.login(req, res);
        }

        if (req.url[0] === '/') {
            req.url = req.url.substr(1);
        }

        res.render(req.url);
    });

    app.get('/*/*.md', function (req, res) {

        var mdPath = path.join(rootPath,'client','app',req.url);
        fs.readFile(mdPath,'utf8', function (err, data) {
            if (err) {
//                console.log(err);
                res.json(200, { markdown : err});
            };
//            console.log(data);
            res.json(200, { markdown : data});
        });
    });

    ///////////////////////////////////////////
    // Socket.IO
    ///////////////////////////////////////////

    // socket.io log levels mapping
    var socketLogLevel = {
        FATAL: 0,
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        TRACE: 3
    };

    // default config
    io.configure(function () {
        // set socket.io redis store
        io.set('store', new RedisSocketStore({
            redisPub: pub,
            redisSub: sub,
            redisClient: redisClient
        }));

        // Transport
        io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling']);

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
                        data.session = session;
                        data.session.sessionID = sessionId;
                        callback(null, true);
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

        io.set('logger', socketLog);
        io.set('log level', socketLogLevel[config.logging.socket]);
    });

    // development config
    io.configure('development', function () {
        io.set('log level', socketLogLevel[config.logging.socket]);
    });

    var socketApi = api.socket({config: config, logging: logging, rights: rights, server: {app: app}});

    // socket connection event
    io.sockets.on('connection', function (socket) {
        var session = socket.handshake.session;

        // save socketId in session
        session.socketID = socket.id;

        syslog.info('socket: client connected');
        syslog.info('socket: {socketId: %s, username: %s, sessionID: %s }', socket.id, ((session.user || {}).name || 'no user'), session.sessionID);

        socket.on('disconnect', function () {
            syslog.info('socket: %s disconnected', socket.id);
        });

        // register socket events based on user acl
        socketApi.register(socket, rights.getAclObj((session.user || {}).acl));
    });

    ///////////////////////////////////////////
    // Baboon API
    ///////////////////////////////////////////

    return {
        middleware: middleware,
        config: config,
        rights: rights,
        server: {
            start: startServer,
            sio: io,
            app: app
        },
        logging: {
            audit: audit,
            syslog: syslog
        }
    };
};