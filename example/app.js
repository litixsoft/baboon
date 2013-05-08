'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app,
    config = server.config,
    auth = middleware.auth,
    api = require(config.path.api);

///////////////////////////////////////////
// routes
///////////////////////////////////////////

app.get('/test/:scenario', function (req, res) {
    res.render('runner', {test: req.params.scenario});
});

// login route
app.get('/login', function (req, res) {
    res.render('login');
});

//app.get('*', function(req, res) {
//    res.render('index');
//});

// login middleware
//app.post('/login', auth.login);
//
//// logout middleware
//app.get('/logout', auth.logout);

///////////////////////////////////////////
// api
///////////////////////////////////////////

// enable socket.io api
api.socket({
    io: server.sio,
    syslog: baboon.server.syslog,
    audit: baboon.server.audit,
    config: config
});

///////////////////////////////////////////
// server
///////////////////////////////////////////

// start express server
server.start();