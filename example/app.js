'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    config = baboon.server.config,
    server = baboon.server,
    api = require(config.path.api);

api.socket(server.sio, server.syslog);

server.start();