'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app,
    config = baboon.config,
    api = require(config.path.api);

///////////////////////////////////////////
// extra routes
///////////////////////////////////////////

// toplevel ui_examples route
app.get('/ui', function (req, res) {
    middleware.auth.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('ui');
    });
});
app.get('/ui/*', function (req, res) {
    middleware.auth.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('ui');
    });
});

///////////////////////////////////////////
// api
///////////////////////////////////////////

// enable socket.io api
api.socket(baboon);

///////////////////////////////////////////
// server
///////////////////////////////////////////

// start express server
server.start();