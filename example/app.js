'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    server = baboon.server,
    config = server.config,
    api = require(config.path.api);

// socket.io events
api.socket(server.sio, baboon.server.syslog);

// start express server
server.start();