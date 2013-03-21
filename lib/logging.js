//noinspection JSUnresolvedVariable
module.exports = function (log4js, mode) {
    'use strict';

    var syslog,
        audit,
        socket,
        express;

    if (mode === 'production') {
        // log in file
        log4js.configure({
            appenders: [
                { type: 'file', filename: 'logs/sys/sys.log', maxLogSize: 20480, backups: 3,
                    category: 'syslog' },
                { type: 'file', filename: 'logs/audit/audit.log', maxLogSize: 20480, backups: 3,
                    category: 'audit' },
                { type: 'file', filename: 'logs/express/express.log', maxLogSize: 20480, backups: 3,
                    category: 'express' },
                { type: 'file', filename: 'logs/socket/socket.log', maxLogSize: 20480, backups: 3,
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