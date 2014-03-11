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

// Express Configuration
require('./server/config/express')(app, baboon);

//// Api routing
//require('./server/routes/api')(app, baboon);
//
// App routing
require('./server/routes')(app, baboon);

baboon.transport.addController(require('./server/routes/api')(), '');

app.use('/api/', baboon.transport.processRequest);
app.get('/api/*', baboon.transport.processRequest);

// Catch all other requests as main angular app
app.get('*', function (req, res) {
    res.render('app/main/index');
});

// Start server
var server = baboon.serverListen(app);

// socket
var io = require('socket.io').listen(server);
io.configure(function () {
    // Transport
    io.set('transports', ['websocket']);
});

// socket connection event
io.sockets.on('connection', function (socket) {
    console.log('########## socket client connected');

    socket.on('disconnect', function () {
        console.log('########## socket disconnected: %s', socket.id);
    });

    baboon.transport.registerSocketEvents(socket);
});

// Expose app
var exports;
exports = module.exports = app;