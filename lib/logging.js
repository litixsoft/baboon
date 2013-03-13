(function (exports) {
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
                high: 0,
                medium: 1,
                small: 2
            },
            colors: {
                high: 'magenta',
                medium: 'blue',
                small: 'white'
            }
        },
        syslog = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)()
            ],
            levels: syslogLevels.levels,
            colors: syslogLevels.colors
        }),
        audit = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)()
            ],
            levels: auditLevels.levels,
            colors: auditLevels.colors
        });

    function init(name, config) {

        var i = 0,
            max = config.length;

        for (i, max; i < max; i += 1) {
            if (name === 'syslog') {
                syslog.add(new (winston.transports[config[i].transport])({colorize: true, level: config[i].level}));
            }
            else if (name === 'audit') {
                //audit.add(winston.transports[config[i].transport], {colorize: true, level: config[i].level});
            }
        }

    }

    function getSyslog(config) {
        if (typeof config === 'object') {
            init('syslog', config);
        }

        return syslog;
    }

    function getAudit(config) {
        if (typeof config !== 'object') {
            init('syslog', config);
        }

        return audit;
    }

    exports.getAudit = getAudit;
    exports.getSyslog = getSyslog;
})(module.exports);