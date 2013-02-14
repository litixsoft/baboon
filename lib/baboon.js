module.exports = function (basePath) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var express = require('express'),
        http = require('http'),
        path = require('path'),
        fs = require('fs'),
        config = require(basePath + '/config.json'),
        dal = require('bbdal'),
        baboonDb = dal.MongoDb(config.mongoHost, config.mongoPort, config.baboonDb),
        RedisStore = require('connect-redis')(express),
        consolidate = require('consolidate'),
        handlebars = require('handlebars'),
        middleware,
        app = express();

    //noinspection JSUnresolvedFunction
    config.basePath = basePath;
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    config.publicPath = path.join(basePath, 'public');
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    config.appPath = path.join(basePath, 'app');
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable,JSCheckFunctionSignatures
    config.partialPath = path.join(basePath, 'views', 'partials');

    // middleware
    middleware = require('./middleware')(config);

    (function configServer() {

        // view engine for application
        app.engine('html', consolidate.handlebars);

        // partial vars
        var stylesHtml, scriptsHtml, navigationHtml, sessionControlHtml;

        // register styles
        //noinspection JSUnresolvedFunction
        stylesHtml = path.join(config.partialPath, 'styles.html');
        //noinspection JSUnresolvedFunction
        handlebars.registerPartial('styles', fs.readFileSync(stylesHtml, 'utf8'));

        // register scripts
        //noinspection JSUnresolvedFunction
        scriptsHtml = path.join(config.partialPath, 'scripts.html');
        //noinspection JSUnresolvedFunction
        handlebars.registerPartial('scripts', fs.readFileSync(scriptsHtml, 'utf8'));

        // register navigation
        //noinspection JSUnresolvedFunction
        navigationHtml = path.join(config.partialPath, 'navigation.html');
        //noinspection JSUnresolvedFunction
        handlebars.registerPartial('navigation', fs.readFileSync(navigationHtml, 'utf8'));

        // register sessionControl
        //noinspection JSUnresolvedFunction
        sessionControlHtml = path.join(config.partialPath, 'sessionControl.html');
        //noinspection JSUnresolvedFunction
        handlebars.registerPartial('sessionControl', fs.readFileSync(sessionControlHtml, 'utf8'));
    })();
    (function configExpress() {
        function configExpHandler() {
            //noinspection JSUnresolvedVariable
            app.set('port', config.httpPort);
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

            //noinspection JSUnresolvedFunction
            /**
             * Static content before session middleware,
             * prevents the session checking for static files in public.
             */
            app.use(express.static(config.publicPath));

            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            app.use(express.cookieParser());

            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            /**
             * Session has session cookie with expires:false.
             * Session is only destroyed when the user closes the browser.
             * Redis ttl is maximal lifetime of session, after this time session is destroyed
             * Middleware checks the inactive period of the session by user.
             * When this period is over, the session destroyed.
             */
            app.use(express.session({

                key: config.sessionKey,
                store: new RedisStore({
                    host: config.redisHost,
                    port: config.redisPort,
                    ttl: config.sessionMaxLife
                }),
                secret: config.sessionSecret,
                cookie: {expires: false}
            }));

            /**
             * Middleware: check session activity.
             * Is session activity time over, session destroy and redirect /login.
             */
            app.use(middleware.auth.sessionActivity);

            /**
             * Middleware: check if exists session.
             * If not exists, setting guest.
             */
            app.use(middleware.auth.sessionExists);

            // site context vars middleware
            //app.use(middleware.siteContext);
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
        app.configure(configExpHandler);
    })();

    function startServer() {
        //noinspection JSCheckFunctionSignatures
        http.createServer(app).listen(app.get('port'), function () {
            //noinspection JSUnresolvedVariable
            if (config.serverMode === 'development') {
                console.error('server has been started in development mode');
            } else {
                console.log('server has been started in production mode');
            }
            console.log('application server listening on port ' + app.get('port'));
        });
    }

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
            start:  startServer
        },
        config: config,
        dal: dal,
        baboonDb: baboonDb
    };
};