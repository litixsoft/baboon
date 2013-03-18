module.exports = function (basePath) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var express = require('express'),
        https = require('https'),
        path = require('path'),
        fs = require('fs'),
        logging = require('./logging'),
        config = require('./config')(path, fs, basePath, logging),
        syslog = logging.syslog,
        audit = logging.audit,
        redis = require('redis'),
        redisClient = redis.createClient(6379, 'localhost'),
        RedisSessionStore = require('connect-redis')(express),
        consolidate = require('consolidate'),
        handlebars = require('handlebars'),
        middleware = {},
        app = express(),
        serverOptions = {
            key: fs.readFileSync('ssl/ssl.key'),
            cert: fs.readFileSync('ssl/ssl.crt')
        },
        server = https.createServer(serverOptions, app),
        io = require('socket.io').listen(server),
        RedisSocketStore = require('socket.io/lib/stores/redis'),
        pub = redis.createClient(6379, 'localhost'),
        sub = redis.createClient(6379, 'localhost');

    // check redis client
    redisClient.on('error', function (err) {
        var msg = 'error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err;
        syslog.error(msg);
        throw new Error(msg);
    });

    ///////////////////////////////////////////
    // Middleware
    ///////////////////////////////////////////

    middleware = require('./middleware')(config);

    ///////////////////////////////////////////
    // Server
    ///////////////////////////////////////////

    // start server
    var startServer = function () {
        //noinspection JSCheckFunctionSignatures
        server.listen(app.get('port'), function () {
            if (config.mode !== 'production') {
                syslog.warn('application server has been started in ' + config.mode + ' mode');
            }
            else {
                syslog.info('application server has been started in ' + config.mode + ' mode');
            }

            syslog.info('application server listening on port ' + app.get('port'));
        });
    };

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
    var tmpSocket = 'https://' + config.host + ':' + config.port;
    //noinspection JSUnresolvedFunction
    handlebars.registerPartial('scripts', fs.readFileSync(scriptsHtml, 'utf8')
        .replace('<!--baboon-socketConnection-->', 'var socket = io.connect(\'' + tmpSocket + '\');'));

    // register navigation
    navigationHtml = path.join(config.partialPath, 'navigation.html');
    //noinspection JSUnresolvedFunction
    handlebars.registerPartial('navigation', fs.readFileSync(navigationHtml, 'utf8'));

    // register sessionControl
    sessionControlHtml = path.join(config.partialPath, 'sessionControl.html');
    //noinspection JSUnresolvedFunction
    handlebars.registerPartial('sessionControl', fs.readFileSync(sessionControlHtml, 'utf8'));

    ///////////////////////////////////////////
    // Express
    ///////////////////////////////////////////

    // express default config
    var expressDefaultConfig = function () {

        //noinspection JSUnresolvedVariable
        app.set('port', config.port);
        //noinspection JSUnresolvedVariable
        app.set('views', config.basePath + '/views');
        app.set('view engine', 'html');
        //noinspection JSUnresolvedFunction
        app.use(express.favicon());
        //noinspection JSUnresolvedVariable
        if (config.mode === 'production') {
            //noinspection JSUnresolvedVariable
            app.use(express.logger({format: config.logging.express}));
        }
        else {
            //noinspection JSUnresolvedVariable
            app.use(express.logger({format: config.logging.express}));
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
    };

    //noinspection JSValidateTypes
    app.configure(expressDefaultConfig);


    ///////////////////////////////////////////
    // Socket.IO
    ///////////////////////////////////////////

    // set socket.io redis store
    io.set('store', new RedisSocketStore({
        redisPub : pub,
        redisSub : sub,
        redisClient : redisClient
    }));

    // configure socket.io
    io.configure('production', function () {
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        //noinspection JSUnresolvedVariable
        io.set('log level', config.logging.socket);

        io.set('transports', [
            'websocket',
            'flashsocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);
    });

    io.configure('development', function () {
        //noinspection JSUnresolvedVariable
        io.set('log level', config.logging.socket);
        io.set('transports', ['websocket']);
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
            io: io,
            config: config,
            audit: audit,
            syslog: syslog
        }
    };
};