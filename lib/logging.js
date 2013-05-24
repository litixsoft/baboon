/**
 * The logging module.
 *
 * @param {!String} path The path where to log.
 * @param {!String} nodeEnv The nodejs env variable.
 * @param {!number} maxLogSize The max log size in kb when logging to files.
 * @param {!number} backups The number of backups when loggin go to files.
 * @returns {{syslog: Logger, audit: Logger, socket: Logger, express: Logger}}
 */
module.exports = function (path, nodeEnv, maxLogSize, backups) {
    'use strict';

    var log4js = require('log4js'),
        fs = require('fs'),
        syslog,
        audit,
        socket,
        express;

    if (nodeEnv === 'production') {
        // create directories if not exists
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        if (!fs.existsSync(path + '/sys')) {
            fs.mkdirSync(path + '/sys');
        }

        if (!fs.existsSync(path + '/audit')) {
            fs.mkdirSync(path + '/audit');
        }

        if (!fs.existsSync(path + '/express')) {
            fs.mkdirSync(path + '/express');
        }

        if (!fs.existsSync(path + '/socket')) {
            fs.mkdirSync(path + '/socket');
        }

        // log in file
        log4js.configure({
            appenders: [
                { type: 'file', filename: path + '/sys/sys.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'syslog' },
                { type: 'file', filename: path + '/audit/audit.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'audit' },
                { type: 'file', filename: path + '/express/express.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'express' },
                { type: 'file', filename: path + '/socket/socket.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'socket' }
            ]
        });
    } else {
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
    //noinspection JSUnresolvedFunction
    socket = log4js.getLogger('socket');

    return {
        syslog: syslog,
        audit: audit,
        socket: socket,
        express: express
    };
};