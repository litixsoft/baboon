'use strict';

module.exports = function () {
    /**
     * Contains all configuration functions.
     * @type {{production: object, development: object, unitTest: object, e2eTest: object}}
     */
    var config = {};

    /**
     * The production configuration
     * This configuration used when no other configuration is specified.
     *
     * @returns {Object} config
     */
    config.production = function () {

        // Contains all settings for this configuration
        return {
            node_env: 'production',
            app_name: 'Baboon Example App',
            protocol: 'http',
            host: '127.0.0.1',
            port: 3000,
            rights: {
                enabled: false,
                masterLoginPage: false,
                database: 'localhost:27017/baboon_rights?w=1&journal=True&fsync=True'
            },
            session: {
                key: 'baboon.sid',
                secret: 'a7f4eb39-744e-43e3-a30b-3ffea846030f',
                maxLife: 804600,
                inactiveTime: 3600,
                stores: {
                    inMemory: {
                        type: 'inMemory'
                    },
                    redis: {
                        type: 'redis',
                        host: 'localhost',
                        port: 6379
                    },
                    mongoDb: {
                        type: 'mongoDb',
                        host: 'localhost',
                        port: 27017,
                        dbName: 'baboon_sessions',
                        collectionName: 'sessions'
                    },
                    tingoDb: {
                        type: 'tingoDb',
                        dbPath: './.tmp',
                        collectionName: 'sessions'
                    }
                },
                activeStore: 'inMemory'
            },
            logging: {
                appenders: {
                    file: {
                        maxLogSize: 2048000,
                        backups: 10
                    },
                    db: 'localhost:27017/baboon_logs'
                },
                loggers: {
                    audit: {
                        active: true,
                        level: 'INFO',
                        appender: 'log4js-node-mongodb'
                    },
                    syslog: {
                        active: true,
                        level: 'INFO',
                        appender: 'file'
                    },
                    express: {
                        active: true,
                        level: 'INFO',
                        appender: 'file'
                    },
                    socket: {
                        active: true,
                        level: 'INFO',
                        appender: 'file'
                    }
                }
            },
            mail: {
                type: 'PICKUP', // only SMTP and PICKUP are allowed (default: 'SMTP')
                directory: 'C:/Temp/Mail' // required for type PICKUP
            }
        };
    };

    /**
     * The development configuration
     * Development inherits all settings of the production.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.development = function () {

        // Config contains all settings from production.
        var settings = config.production();

        // Overwrite the settings for this configuration
        settings.node_env = 'development';
        settings.logging.loggers.audit.level = 'DEBUG';
        settings.logging.loggers.audit.appender = 'console';
        settings.logging.loggers.syslog.level = 'DEBUG';
        settings.logging.loggers.syslog.appender = 'console';
        settings.logging.loggers.express.level = 'DEBUG';
        settings.logging.loggers.express.appender = 'console';
        settings.logging.loggers.socket.level = 'DEBUG';
        settings.logging.loggers.socket.appender = 'console';

        return settings;
    };

    /**
     * The unitTest configuration
     * UnitTest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.unitTest = function () {

        // Config contains all settings from development.
        var settings = config.production();
        settings.node_env = 'development';
        settings.logging.appenders.db = 'localhost:27017/test_baboon_logs';

        settings.mail.directory = 'C:/Temp/Mail';
        settings.mail.type = 'PICKUP';

        return settings;
    };

    /**
     * The e2eTest configuration
     * E2ETest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.e2eTest = function () {

        // Config contains all settings from development.
        var settings = config.development();

        // overwrite the settings for this configuration
        settings.port = 3003;

        return settings;
    };

    /**
     * The e2eTest production configuration
     * E2ETest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.e2eProductionTest = function () {

        // Config contains all settings from development.
        var settings = config.development();

        // overwrite the settings for this configuration
        settings.port = 3003;
        settings.node_env = 'production';

        return settings;
    };

    /**
     * The e2eTest production configuration
     * E2ETest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.productionLog = function () {

        // Config contains all settings from development.
        var settings = config.production();

        // overwrite the settings for this configuration
        settings.logging.loggers.audit.level = 'DEBUG';
        settings.logging.loggers.audit.appender = 'console';
        settings.logging.loggers.syslog.level = 'DEBUG';
        settings.logging.loggers.syslog.appender = 'console';
        settings.logging.loggers.express.level = 'DEBUG';
        settings.logging.loggers.express.appender = 'console';
        settings.logging.loggers.socket.level = 'DEBUG';
        settings.logging.loggers.socket.appender = 'console';

        return settings;
    };

    return config;
};