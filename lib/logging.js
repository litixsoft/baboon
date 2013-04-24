//noinspection JSUnresolvedVariable
module.exports = function (path, mode) {
    'use strict';

    var log4js = require('log4js'),
        fs = require('fs'),
        syslog,
        audit,
        socket,
        express;

    if (mode === 'production') {

        // create directories if not exists
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        if(!fs.existsSync(path + '/sys')) {
            fs.mkdirSync(path + '/sys');
        }
        if(!fs.existsSync(path + '/audit')) {
            fs.mkdirSync(path + '/audit');
        }
        if(!fs.existsSync(path + '/express')) {
            fs.mkdirSync(path + '/express');
        }
        if(!fs.existsSync(path + '/socket')) {
            fs.mkdirSync(path + '/socket');
        }

        // log in file
        log4js.configure({
            appenders: [
                { type: 'file', filename: path + '/sys/sys.log', maxLogSize: 20480, backups: 3,
                    category: 'syslog' },
                { type: 'file', filename: path + '/audit/audit.log', maxLogSize: 20480, backups: 3,
                    category: 'audit' },
                { type: 'file', filename: path + '/express/express.log', maxLogSize: 20480, backups: 3,
                    category: 'express' },
                { type: 'file', filename: path + '/socket/socket.log', maxLogSize: 20480, backups: 3,
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
    //noinspection JSUnresolvedFunction
    socket = log4js.getLogger('socket');

    return {
        syslog: syslog,
        audit: audit,
        socket: socket,
        express: express
    };
};