'use strict';

var path = require('path');
var baboon = require('../lib/baboon')(path.join(__dirname));
var middleware = baboon.middleware;
var server = baboon.server;
var app = server.app;

///////////////////////////////////////////
// routes config
///////////////////////////////////////////

// toplevel admin routes
app.get('/admin', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.nav.setNavData(req);

        if (baboon.rights.userHasAccessTo(req.session.user, 'baboon/admin/user/create')) {
            res.render('admin/index');
        } else {
            res.render('index');
        }
    });
});

// toplevel admin catch all route
app.get('/admin/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.nav.setNavData(req);

        if (baboon.rights.userHasAccessTo(req.session.user, 'baboon/admin/user/create')) {
            res.render('admin/index');
        } else {
            res.render('index');
        }
    });
});

///////////////////////////////////////////
// start server
///////////////////////////////////////////

baboon.server.start();