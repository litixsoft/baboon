(function (exports) {
    'use strict';

    //noinspection JSUnresolvedFunction
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

    /**
     * add transport
     * @param log
     * @param transport
     * @param level
     * @param logfile
     */
    function addTransport(log, transport, level, logfile) {

        transport = transport.charAt(0).toUpperCase() + transport.slice(1);

        if (transport === 'File') {

            if (typeof logfile === 'undefined') {
                throw new Error('missing parameter logfile');
            }

            log.add(winston.transports.File, {filename: logfile, level: level});
        }
        else {
            log.add(winston.transports[transport], {colorize: true, level: level});
        }
    }

    function SetupSyslog(level, transports, logPath) {

        if (arguments.length < 3) {
            throw new Error('missing parameters');
        }

        var i = 0,
            max = transports.length;

        // remove default transport
        syslog.remove(winston.transports.Console);

        for (i, max; i < max; i += 1) {
            addTransport(syslog, transports[i], level, logPath);
        }
    }

    function SetupAudit(level, transports, logPath) {

        if (arguments.length < 3) {
            throw new Error('missing parameters');
        }

        var i = 0,
            max = transports.length;

        // remove default transport
        audit.remove(winston.transports.Console);

        for (i, max; i < max; i += 1) {
            addTransport(audit, transports[i], level, logPath);
        }
    }

    exports.SetupSyslog = SetupSyslog;
    exports.SetupAudit = SetupAudit;
    exports.syslog = syslog;
    exports.audit = audit;

})(module.exports);