'use strict';

var express = require('express');
var rootPath = __dirname;
var baboon = require('../lib/baboon')(rootPath);
var app = express();
var server = baboon.getServer(app);
var io = require('socket.io').listen(server);

// Express configuration
require('../lib/config/express')(app, baboon);

// Socket.Io configuration
require('../lib/config/socket-io')(io, baboon);

// App routing
require('./server/routes')(app, baboon);

// Start server
baboon.serverListen(server);

// Expose app
var exports;
exports = module.exports = app;