'use strict';

// Module dependencies.
var stdio = require('stdio');

// Set command line arguments
var argv = stdio.getopt({
    'config': {key: 'c', args:1, description: 'Use the specified config section'},
    'port': {args:1, description: 'Use the specified port'},
    'protocol': {args:1, description: 'Use the specified protocol'},
    'livereload': {description: 'Use livereload snippet for client'}
});

var express = require('express');
var rootPath = __dirname;
var baboon = require('../lib/baboon')(rootPath, argv);
var app = express();
var server = baboon.getServer(app);
var io = require('socket.io').listen(server);

// Express configuration
require('./server/config/express')(app, baboon);

// Socket.Io configuration
require('./server/config/socket-io')(io, baboon);

// App routing
require('./server/routes')(app, baboon);

// Catch all other requests as main angular app
app.get('*', function (req, res) {

    res.render('app/main/index');
});

// socket connection event
io.sockets.on('connection', function (socket) {
//    console.log(socket.id);
//    console.log(io.handshaken[socket.id].headers.cookie);
    baboon.transport.registerSocketEvents(socket);
});

// Start server
baboon.serverListen(server);

// Expose app
var exports;
exports = module.exports = app;