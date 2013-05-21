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

// default route for application
app.get('/', function(req, res) {
    server.sendFile('/index.html', res);
});

// toplevel ui_examples route
app.get('/ui', function(req, res) {
    server.sendFile('/ui.html', res);
    //res.render('ui');
});

// catch all html files
app.get('*.html', function(req, res) {
    console.log('los gehts');
    server.sendFile('/views' + req.url, res);
});

// catch all files
app.get('*.*', function(req, res) {
    server.sendFile(req.url, res);
});

// catch all routes
app.get('*', function(req, res) {
    server.sendFile('/index.html', res);
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