module.exports = function (rootPath) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var express = require('express'),
        path = require('path'),
        fs = require('fs'),
        clc = require('cli-color'),
        config = require('./config')(rootPath),
        log4js = require('log4js'),
        logging = require('./logging')(config.logs, config.mode),
        syslog = logging.syslog,
        audit = logging.audit,
        expressLog = logging.express,
        socketLog = logging.socket,
        redis = require('redis'),
        redisClient = redis.createClient(config.redis.server1.port, config.redis.server1.port),
        RedisSessionStore = require('connect-redis')(express),
        middleware = {},
        app = express(),
        serverOptions = {
            key: fs.readFileSync('server/ssl/ssl.key'),
            cert: fs.readFileSync('server/ssl/ssl.crt')
        },
        RedisSocketStore = require('socket.io/lib/stores/redis'),
        pub = redis.createClient(config.redis.server1.port, config.redis.server1.port),
        sub = redis.createClient(config.redis.server1.port, config.redis.server1.port);

    ///////////////////////////////////////////
    // config server
    ///////////////////////////////////////////
    var server;

    if(config.protocol === 'https') {
        var https = require('https');
        server = https.createServer(serverOptions, app);
    }
    else if(config.protocol === 'http') {
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
    //middleware.site = require('./middleware/site')(config.appName);

    ///////////////////////////////////////////
    // start server
    ///////////////////////////////////////////

    var startServer = function () {
        //noinspection JSCheckFunctionSignatures
        var startOn = 'application server has been started on: ' +
            config.protocol + '://' + config.host + ':' + config.port;
        var startMode = 'application server has been started in ' + config.mode + ' mode';
        var notice = clc.cyan;

        server.listen(app.get('port'), function () {
            syslog.info(startOn);

            if (config.mode !== 'production') {
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
    // Express
    ///////////////////////////////////////////

    // express default config
    var expressConfig = function () {

        //noinspection JSUnresolvedVariable
        app.set('port', config.port);
        //noinspection JSUnresolvedVariable
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        if (config.mode === 'production') {
            //noinspection JSUnresolvedVariable
            expressLog.setLevel(config.logging.express);
            app.use(log4js.connectLogger(expressLog, { level: log4js.levels.INFO}));
        }
        else {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            app.use(express.logger({format: config.logging.express}));
        }
        //noinspection JSUnresolvedFunction
        app.use(express.favicon());
        //noinspection JSUnresolvedFunction
        app.use(express.bodyParser());
        //noinspection JSUnresolvedFunction
        app.use(express.methodOverride());
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
            store: new RedisSessionStore({
                client: redisClient,
                ttl: config.sessionMaxLife
            }),
            secret: config.sessionSecret,
            cookie: {expires: false}
        }));
        // Check session activity. Is session activity time over, session destroy and redirect /login.
        app.use(middleware.auth.sessionActivity);
        // Check if exists session. If not exists, setting guest.
        app.use(middleware.auth.sessionExists);
        // routing
        app.use(app.router);
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

    /**
     * send static file to client
     * @param pathname
     * @param res
     */
    function sendFile (pathname, res) {

        var filePath = path.join(config.distPath, pathname);
        if (fs.existsSync(filePath)) {
            res.sendfile(filePath);
        }
        else {
            res.send(404);
        }
    }

    /**
     * routes
     */
    app.get('/', function (req, res) {
        sendFile('index.html', res);

    });

    app.get('*.*', function (req, res) {
        sendFile(req.url, res);

    });

    app.get('*', function (req, res) {
        sendFile('index.html', res);

    });

    ///////////////////////////////////////////
    // Socket.IO
    ///////////////////////////////////////////

    // configure socket.io

    // default config
    io.configure(function () {
        // set socket.io redis store
        io.set('store', new RedisSocketStore({
            redisPub : pub,
            redisSub : sub,
            redisClient : redisClient
        }));
    });

    // production config
    io.configure('production', function () {
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file

        io.set('transports', [
            'websocket',
            'flashsocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);

        io.set('logger', socketLog);
        //noinspection JSUnresolvedVariable
        io.set('log level', log4js.levels[config.logging.socket]);
    });

    // development config
    io.configure('development', function () {
        //noinspection JSUnresolvedVariable
        io.set('transports', ['websocket']);
        //noinspection JSUnresolvedVariable
        io.set('log level', log4js.levels[config.logging.socket]);
    });

    ///////////////////////////////////////////
    // Baboon API
    ///////////////////////////////////////////

    return {
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
            sio: io,
            config: config,
            audit: audit,
            syslog: syslog
        }
    };
};