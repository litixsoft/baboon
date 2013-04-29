'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../../lib/baboon')(path.join(__dirname, '../')),
    server = baboon.server,
    api = require('server/api');

api.socket(server.sio, server.syslog);

server.start();