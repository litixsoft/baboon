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
    var path = config.path.logs,
        maxLogSize = config.logging.maxLogSize,
        backups = config.logging.backups;

    if (config.node_env === 'production') {
        // create directories if not exists
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

        // log in file
        log4js.configure({
            appenders: [
                { type: 'file', filename: path + '/sys/sys.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'syslog' },
                { type: 'file', filename: path + '/express/express.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'express' },
                { type: 'file', filename: path + '/socket/socket.log', maxLogSize: maxLogSize, backups: backups,
                    category: 'socket' },
                { type: 'log4js-node-mongodb', connectionString: config.mongo.logs, collectionName: 'audit',
                    write: 'save', category: 'audit'
                }
            ]
        });
    } else {
        // log in console
        log4js.configure({
            appenders: [
                { type: 'console' },
                { type: 'log4js-node-mongodb', connectionString: config.mongo.logs, collectionName: 'audit',
                    category: 'audit'
                }
            ]
        });
    }

    return {
        syslog: log4js.getLogger('syslog'),
        audit: log4js.getLogger('audit'),
        socket: log4js.getLogger('socket'),
        express: log4js.getLogger('express')
    };
};