'use strict';
process.env.NODE_ENV = 'unitTest';

var path = require('path'),
    rootPath = path.resolve('..', '..', 'baboon/example'),
    config = require('../../../lib/config.js')(rootPath);

//console.dir(config);

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

    return {
        logging: {
            syslog: syslog,
            audit: syslog
        },
        config: config
    };
};