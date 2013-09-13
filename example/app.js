'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app;
//    config = baboon.config;
//    api = require(config.path.api);

///////////////////////////////////////////
// extra routess
///////////////////////////////////////////

// toplevel ui_examples route
app.get('/ui', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('toplevel/ui_examples/ui');
    });
});

app.get('/ui/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('toplevel/ui_examples/ui');
    });
});

// toplevel admin routes
app.get('/admin', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('toplevel/admin/admin');
    });
});

// test
app.get('/admin/startAdministration', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        var lxHelpers = require('lx-helpers');

        baboon.rights.data().getExtendedAcl(req.session.user, ['Admin'], function (error, result) {
            if (error) {
                baboon.logging.syslog.error(error);
                res.render('404');
                return;
            }

            if (result) {
                req.session.user.acl = result;

                var navigation = baboon.config.path.navigation ? require(baboon.config.path.navigation) : null,
                    userNavigation = baboon.rights.secureNavigation(req.session.user, navigation),
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

app.get('/admin/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin/admin');
    });
});

///////////////////////////////////////////
// api
///////////////////////////////////////////

// enable socket.io api
//api.socket(baboon);

///////////////////////////////////////////
// server
///////////////////////////////////////////

// start express server
server.start();