//noinspection JSUnresolvedVariable
module.exports = function (log4js, mode) {
    'use strict';

    /**
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


     **/

    var syslog,
        audit,
        socket,
        express;

    if (mode === 'production') {
        // log in file
        log4js.configure({
            appenders: [
                { type: 'file', filename: 'logs/sys.log', maxLogSize: 20480, backups: 3,
                    category: 'syslog' },
                { type: 'file', filename: 'logs/audit.log', maxLogSize: 20480, backups: 3,
                    category: 'audit' },
                { type: 'file', filename: 'logs/express.log', maxLogSize: 20480, backups: 3,
                    category: 'express' },
                { type: 'file', filename: 'logs/socketio.log', maxLogSize: 20480, backups: 3,
                    category: 'socket' }
            ]
        });
    }
    else {
        // log in console
        log4js.configure({
            appenders: [
                { type: 'console' }
            ]
        });
    }

    //noinspection JSUnresolvedFunction
    syslog = log4js.getLogger('syslog');
    //noinspection JSUnresolvedFunction
    audit = log4js.getLogger('audit');
    //noinspection JSUnresolvedFunction
    express = log4js.getLogger('express');

    socket = function () {
        //noinspection JSUnresolvedFunction
        this.logger = log4js.getLogger('socket');
    };

    socket.prototype.error = function () {
        this.logger.error.apply(this.logger, arguments);
    };
    socket.prototype.warn = function () {
        this.logger.warn.apply(this.logger, arguments);
    };
    socket.prototype.info = function () {
        this.logger.info.apply(this.logger, arguments);
    };
    socket.prototype.debug = function () {
        this.logger.debug.apply(this.logger, arguments);
    };

    return {
        syslog: syslog,
        audit: audit,
        socket: socket,
        express: express
    };
};