'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    lxHelpers = require('lx-helper'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app,
    logging = baboon.logging,
    rights = baboon.rights;
//    config = baboon.config;
//    api = require(config.path.api);

///////////////////////////////////////////
// routes config
///////////////////////////////////////////


// toplevel uiExamples route
app.get('/ui', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('uiExamples/index');
    });
});

// toplevel uiExamples catch all route
app.get('/ui/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('uiExamples/index');
    });
});

// toplevel admin routes
app.get('/admin', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin/index');
    });
});

// toplevel admin test route
app.get('/admin/startAdministration', function (req, res) {
    middleware.session.checkSession(req, res, function () {

        rights.data().getExtendedAcl(req.session.user, ['Admin'], function (error, result) {
            if (error) {
                logging.syslog.error(error);
                res.render('404');
                return;
            }

            if (result) {
                req.session.user.acl = result;

                var navigation = config.path.navigation ? require(config.path.navigation) : null,
                    userNavigation = rights.secureNavigation(req.session.user, navigation),
                    topLevelNavigation = [];

                // extract top level navigation links
                lxHelpers.forEach(userNavigation, function (navItem) {
                    var topLevelLink = lxHelpers.clone(navItem);
                    delete topLevelLink.children;

                    topLevelNavigation.push(topLevelLink);
                });

                // save navigation in session
                req.session.navigation = userNavigation;

                res.locals.isAuth = true;
                res.locals.username = req.session.user.name;
                res.locals.navigation = userNavigation;
                res.locals.topLevelNavigation = topLevelNavigation;

                res.render('admin/admin');
                return;
            }

            middleware.context.index(req, res);
            res.render('index');
        });
    });
});

// toplevel admin catch all route
app.get('/admin/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin/admin');
    });
});

///////////////////////////////////////////
// start server
///////////////////////////////////////////

baboon.server.start();