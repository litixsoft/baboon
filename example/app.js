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
        res.render('ui');
    });
});

app.get('/ui/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('ui');
    });
});

// toplevel admin routes
app.get('/admin', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin');
    });
});

app.get('/admin/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin');
    });
});

// toplevel documentation routes
app.get('/doc', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('documentation');
    });
});

app.get('/doc/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('documentation');
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