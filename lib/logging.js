'use strict';

var log4js = require('log4js'),
    fs = require('fs');

/**
 * The logging module.
 *
 * @param {Object} config The config object.
 * @returns {{syslog: Logger, audit: Logger, socket: Logger, express: Logger}}
 */
module.exports = function (config) {
    var path = config.path.logs;
    var maxLogSize = config.logging.maxLogSize;
    var backups = config.logging.backups;
    var appenders;

    if (config.node_env === 'production') {
        // create directories if not exists
        if (!fs.existsSync(config.path.appFolder)){
            fs.mkdirSync(config.path.appFolder);
        }

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        if (!fs.existsSync(path + '/sys')) {
            fs.mkdirSync(path + '/sys');
        }

        if (!fs.existsSync(path + '/express')) {
            fs.mkdirSync(path + '/express');
        }

        if (!fs.existsSync(path + '/socket')) {
            fs.mkdirSync(path + '/socket');
        }

        appenders = [
            { type: 'file', filename: path + '/sys/sys.log', maxLogSize: maxLogSize, backups: backups, category: 'syslog' },
            { type: 'file', filename: path + '/express/express.log', maxLogSize: maxLogSize, backups: backups, category: 'express' },
            { type: 'file', filename: path + '/socket/socket.log', maxLogSize: maxLogSize, backups: backups, category: 'socket' },
        ];

        if (config.mongo && config.mongo.logs) {
            appenders.push({ type: 'log4js-node-mongodb', connectionString: config.mongo.logs, collectionName: 'audit', write: 'save', category: 'audit' });
        } else {
            if (!fs.existsSync(path + '/audit')) {
                fs.mkdirSync(path + '/audit');
            }

            appenders.push({ type: 'file', filename: path + '/socket/audit.log', maxLogSize: maxLogSize, backups: backups, category: 'audit' });
        }
    } else {
        appenders = [
            { type: 'console' }
        ];

        if (config.mongo && config.mongo.logs) {
            appenders.push({ type: 'log4js-node-mongodb', connectionString: config.mongo.logs, collectionName: 'audit', write: 'save', category: 'audit' });
        }
    }

    log4js.configure({appenders: appenders});

    return {
        syslog: log4js.getLogger('syslog'),
        audit: log4js.getLogger('audit'),
        socket: log4js.getLogger('socket'),
        express: log4js.getLogger('express')
    };
};