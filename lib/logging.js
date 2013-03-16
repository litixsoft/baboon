//noinspection JSUnresolvedVariable
module.exports = (function () {
    'use strict';

    var winston = require('winston'),
        syslogLevels = {
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
        auditLevels = {
            levels: {
                A: 0,
                B: 1,
                C: 2
            },
            colors: {
                A: 'magenta',
                B: 'magenta',
                C: 'magenta'
            }
        },
        syslog = new (winston.Logger)({
            transports: [],
            levels: syslogLevels.levels,
            colors: syslogLevels.colors
        }),
        audit = new (winston.Logger)({
            transports: [],
            levels: auditLevels.levels,
            colors: auditLevels.colors
        });

    // init logging
    var Init = function (levels) {
        syslog.add(winston.transports.Console, {colorize: true, level: levels.syslog, json: false });
        audit.add(winston.transports.Console, {colorize: true, level: levels.audit, json: false });
    };

    return {
        Init: Init,
        syslog: syslog,
        audit: audit
    };
})();