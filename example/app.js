'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
//    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app,
    config = baboon.config,
//    auth = middleware.auth,
    api = require(config.path.api);

///////////////////////////////////////////
// routes
///////////////////////////////////////////

// login route
//app.get('/login', function(req, res) {
//    res.render('login');
//});

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
api.socket(baboon);

///////////////////////////////////////////
// server
///////////////////////////////////////////

// start express server
server.start();