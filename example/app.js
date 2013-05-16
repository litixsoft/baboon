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

app.get('/', function(req, res) {
    server.sendFile('/index.html', res);
});

app.get('/ui', function(req, res) {
    server.sendFile('/ui.html', res);
    //res.render('ui');
});

//app.get('*', function(req, res) {
//    server.sendFile(req.url, res);
//    //res.render('ui');
//});

// login route
//app.get('/login', function(req, res) {
//    res.render('login');
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