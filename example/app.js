'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    server = baboon.server,
    middleware = baboon.middleware,
    config = server.config,
    api = require(config.path.api);

// static routes
//noinspection JSUnresolvedVariable
api.static(middleware, server.app, server.sendFile, config.defaultApp);
// socket.io events
api.socket(server.sio, baboon.server.syslog);

// start express server
server.start();