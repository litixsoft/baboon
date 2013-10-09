'use strict';
var path = require('path'),
    rootPath = path.resolve('..', 'baboon', 'example'),
    config = require('../../lib/config.js')(rootPath),
    configFile = require(path.join(rootPath, 'config', 'app.conf.json'));

// override mongo connection strings
config.mongo.rights = configFile.params.unitTest.mongo.rights;

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