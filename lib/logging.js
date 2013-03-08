module.exports = (function () {
    'use strict';

    var winston = require('winston'),
        customLevels = {
            levels: {
                debug: 0,
                info: 1,
                warn: 2,
                error: 3
            },
            colors: {
                debug: 'cyan',
                info: 'green',
                warn: 'yellow',
                error: 'red'
            }
        },
        syslog = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({colorize: true, level: 'debug'})
            ],
            levels: customLevels.levels,
            colors: customLevels.colors
        });

    return {
        syslog: syslog
    };
})();
