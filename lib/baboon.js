module.exports = (function () {
    'use strict';

    //noinspection JSUnresolvedVariable
    var express = require('express'),
        http = require('http'),
        path = require('path'),
        fs = require('fs'),
        dal = require('bbdal'),
        config = {},
        dbs = [],
        baboonDb = {},
        RedisStore = require('connect-redis')(express),
        consolidate = require('consolidate'),
        handlebars = require('handlebars'),
        middleware = {},
        app = express();

    function getDb(dbName) {

        var i, max;
        for (i = 0, max = dbs.length; i < max; i += 1) {
            if (dbs[i].dbName === dbName) {
                return dbs[i].db;
            }
        }

        //noinspection JSUnresolvedVariable
        var db = {},
            server = bbConfig.settings.mongo.server;

        if (server.length > 1) {
            // create replica set
            db = {dbName: dbName, db: dal.MongoDb(server[0].host, server[0].port, dbName)};
            dbs.push(db);
        }
        else {
            // create single mongo
            db = {dbName: dbName, db: dal.MongoDb(server[0].host, server[0].port, dbName)};
            dbs.push(db);
        }

        return db;
    }

    function startServer() {
        //noinspection JSCheckFunctionSignatures
        http.createServer(app).listen(app.get('port'), function () {
            //noinspection JSUnresolvedVariable
            if (bbConfig.serverMode === 'development') {
                console.error('server has been started in development mode');
            } else {
                console.log('server has been started in production mode');
            }
            console.log('application server listening on port ' + app.get('port'));
        });
    }

    (function configureApplication() {

        // configure settings
        //noinspection JSUnresolvedVariable
        if (bbConfig.serverMode === 'development') {
            //noinspection JSUnresolvedVariable
            bbConfig.settings = bbConfig.settings.development;
        }
        else {
            //noinspection JSUnresolvedVariable
            bbConfig.settings = bbConfig.settings.production;
        }

        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        bbConfig.publicPath = path.join(bbConfig.basePath, 'public');
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        bbConfig.appPath = path.join(bbConfig.basePath, 'app');
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable,JSCheckFunctionSignatures
        bbConfig.partialPath = path.join(bbConfig.basePath, 'views', 'partials');

        //noinspection JSUnresolvedVariable
        config = bbConfig;

        // create baboonDb
        baboonDb = getDb(config.settings.baboonDb);

        // middleware
        middleware = require('./middleware');

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
            app.set('port', config.settings.httpPort);
            //noinspection JSUnresolvedVariable
            app.set('views', config.basePath + '/views');
            app.set('view engine', 'html');
            //noinspection JSUnresolvedFunction
            app.use(express.favicon());
            //noinspection JSUnresolvedFunction
            app.use(express.logger('dev'));
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
                store: new RedisStore({
                    host: config.settings.redisHost,
                    port: config.settings.redisPort,
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
        }
        //noinspection JSValidateTypes
        app.configure(configExpressHandler);
    })();

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
            start:  startServer,
            dal: dal,
            baboonDb: baboonDb,
            getDb: getDb
        }
    };
})();