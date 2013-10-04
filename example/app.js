'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    routes = require('./server/routes');

// init app routes
routes.apps(baboon);

// start express server
baboon.server.start();