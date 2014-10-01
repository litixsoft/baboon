'use strict';

var express = require('express');
var rootPath = __dirname;

var baboon = require('../lib/baboon')(rootPath);
var routes = require('../lib/routes')(baboon);

// Express
var app = express();

// Express configuration
require('../lib/config/express')(app, routes, baboon);

// Express server
var server = baboon.appListen(app);

// Socket.Io server
var io = require('socket.io').listen(server);

// Socket.Io configuration
require('../lib/config/socket-io')(io, baboon);

// Expose app
module.exports = app;