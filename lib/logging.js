'use strict';

var log4js = require('log4js');
var chalk = require('chalk');
var fs = require('fs');
var lxHelpers = require('lx-helpers');
var LogError = require('./errors').LogError;

/**
 * The logging module.
 * Returns an object for logging, with the following methods.
 *
 * @param {Object} config a baboon config object.
 * @return {Object}
 */
module.exports = function (config) {
    // check parameter
    if (typeof config !== 'object') {
        throw new LogError('Parameter config is required and must be a string type!');
    }

    var loggers = {};
    var logPath = config.path.logs;
    var maxLogSize = config.logging.appenders.file.maxLogSize;
    var backups = config.logging.appenders.file.backups;
    var appenders = [];

    /**
     * Set appender for logging and audit
     *
     * @param {String} appender The type of logging
     * @param {String} category The name of logging file or collection name
     */
    var setAppender = function (appender, category) {
        // check appender type
        switch (appender) {
            case 'log4js-node-mongodb':
                // push db appender
                appenders.push(
                    {
                        type: 'log4js-node-mongodb',
                        connectionString: config.logging.appenders.db,
                        collectionName: category,
                        write: 'save',
                        category: category
                    }
                );
                break;
            case 'file':
                // push file appender
                appenders.push(
                    {
                        type: 'file',
                        filename: logPath + '/' + category + '/' + category + '.log',
                        maxLogSize: maxLogSize,
                        backups: backups,
                        category: category
                    }
                );

                // create directory if not exists
                if (!fs.existsSync(logPath + '/' + category)) {
                    fs.mkdirSync(logPath + '/' + category);
                }

                break;
            default:
                // push console as default appender
                appenders.push({type: 'console', category: category});
        }
    };

    // set appenders
    lxHelpers.objectForEach(config.logging.loggers, function (key, value) {
        /** @namespace value.active */
        if (value.active) {
            /** @namespace value.appender */
            setAppender(value.appender, key);
        } else {
            console.log(chalk.yellow('   warning  - ') + 'logger ' + key + ' is inactive');
        }
    });

    // configure log4js
    log4js.configure({
        appenders: appenders
    });

    // create loggers
    lxHelpers.objectForEach(config.logging.loggers, function (key) {
        loggers[key] = log4js.getLogger(key);
        loggers[key].setLevel(config.logging.loggers[key].level);
    });

    return loggers;
};