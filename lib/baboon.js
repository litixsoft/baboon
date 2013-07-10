module.exports = function (rootPath) {
    'use strict';

    //noinspection JSUnresolvedVariable
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
    }
    else if (config.protocol === 'http') {
        var http = require('http');
        server = http.createServer(app);
    }
    else {
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
    //noinspection JSUnresolvedVariable
    middleware.auth = require('./middleware/auth')(config.sessionInactiveTime);
    middleware.context = require('./middleware/context')();

    ///////////////////////////////////////////
    // start server
    ///////////////////////////////////////////

    var startServer = function () {
        //noinspection JSCheckFunctionSignatures
        var startOn = 'application server has been started on: ' +
            config.protocol + '://' + config.host + ':' + config.port;
        var startMode = 'application server has been started in ' + config.nodeEnv + ' mode';

        server.listen(app.get('port'), function () {
            syslog.info(startOn);

            if (config.nodeEnv !== 'production') {
                syslog.warn(startMode);
            }
            else {
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
    //noinspection JSUnresolvedVariable
    app.engine('.html', require('ejs').__express);

    ///////////////////////////////////////////
    // Express
    ///////////////////////////////////////////

    // express default config
    var expressConfig = function () {

        //noinspection JSUnresolvedVariable
        app.set('port', config.port);
        //noinspection JSUnresolvedVariable
        app.set('views', config.path.dist + '/views');
        app.set('view engine', 'html');

        // logging
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        if (config.nodeEnv === 'production') {
            //noinspection JSUnresolvedVariable
            app.use(log4js.connectLogger(expressLog, {level: log4js.levels.INFO}));
        }
        else {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            app.use(express.logger('dev'));
        }

        //noinspection JSUnresolvedFunction
        app.use(express.favicon());
        //noinspection JSUnresolvedFunction
        app.use(express.bodyParser());
        //noinspection JSUnresolvedFunction
        app.use(express.methodOverride());

        // Static content before session middleware,
        // prevents the session checking for static files in public.
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        app.use(express.static(config.path.public));

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
            store: sessionStore,
            secret: config.sessionSecret,
            cookie: {expires: false}
        }));

        // routing
        app.use(app.router);

        // catch all unresolved routes
        app.use(function (req, res) {
            middleware.auth.checkSession(req, res, function(){
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
    //noinspection JSValidateTypes
    app.configure(expressConfig);
    app.configure('development', expressDevelopmentConfig);
    app.configure('production', expressProductionConfig);

    ///////////////////////////////////////////
    // default routes
    ///////////////////////////////////////////

    // login middleware
    app.post('/login', middleware.auth.login);

    // logout middleware
    app.get('/logout', middleware.auth.logout);

    // catch all html view files
    app.get('/*/*.html', function(req, res) {
        if (req.url === '/login/login.html') {
            middleware.context.login(req, res);
        }
        res.render(req.url.substr(1));
    });

    ///////////////////////////////////////////
    // Socket.IO
    ///////////////////////////////////////////

    // configure socket.io

    // default config
    io.configure(function () {
        // set socket.io redis store
        io.set('store', new RedisSocketStore({
            redisPub: pub,
            redisSub: sub,
            redisClient: redisClient
        }));

        // Transport
        io.set('transports',['websocket', 'xhr-polling', 'jsonp-polling']);

        io.set('authorization', function (data, callback) {

            // check if cookie exists
            if (!data.headers.cookie) {
                callback('Error: No cookie transmitted', false);
            }
            else {
                // parse cookie in sessionId
                var signedCookies = require('express/node_modules/cookie').parse(data.headers.cookie);
                //noinspection JSUnresolvedVariable
                var sessionId = require('express/node_modules/connect/lib/utils')
                    .parseSignedCookies(signedCookies, config.sessionSecret)['baboon.sid'];

                // get session from redis session store
                sessionStore.get(sessionId, function (err, session) {
                    data.session = session;
                    data.session.sessionID = sessionId;
                    callback(null, true);
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
        //noinspection JSUnresolvedVariable
        io.set('log level', log4js.levels[config.logging.socket]);
    });

    // development config
    io.configure('development', function () {

        //noinspection JSUnresolvedVariable
        io.set('log level', log4js.levels[config.logging.socket]);
    });

    ///////////////////////////////////////////
    // Baboon API
    ///////////////////////////////////////////

    return {
        middleware: middleware,
        config: config,
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