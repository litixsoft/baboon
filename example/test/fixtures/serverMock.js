'use strict';
process.env.NODE_ENV = 'unitTest';

var path = require('path'),
    rootPath = path.resolve('..', '..', 'baboon/example'),
    config = require('../../../lib/config.js')(rootPath),
    errors = require('../../../lib/errors.js');

process.env.NODE_ENV = undefined;

module.exports = function () {
    var logging = function (msg) {
        console.log(msg);
    };

    var syslog = {
        debug: logging,
        info: logging,
        warn: logging,
        error: logging,
        fatal: logging
    };

    var app = {
        logging: {
            syslog: syslog,
            audit: syslog
        },
        config: config
    };

    for (var err in errors) {
        if (errors.hasOwnProperty(err)) {
            app[err] = errors[err];
        }
    }

    return app;
};