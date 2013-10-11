'use strict';

var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app;

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
        middleware.context.index(req, res);

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