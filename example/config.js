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
    config.production = function() {

        // Contains all settings for this configuration
        return {
            node_env: 'production',
            app_name: 'Baboon Example App',
            protocol: 'http',
            host: '127.0.0.1',
            port: 3000,
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
                    }
                }
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
    config.development = function() {

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

        return settings;
    };

    /**
     * The unitTest configuration
     * UnitTest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.unitTest = function() {

        // Config contains all settings from development.
        var settings = config.production();
        settings.node_env = 'development';
        settings.logging.appenders.db = 'localhost:27017/test_baboon_logs';
        return settings;
    };

    /**
     * The e2eTest configuration
     * E2ETest inherits all settings of the development.
     * These can be changed, overwritten or extended.
     *
     * @returns {Object} config
     */
    config.e2eTest = function() {

        // Config contains all settings from development.
        var settings = config.development();

        // overwrite the settings for this configuration
        settings.port = 3003;

        return settings;
    };

    return config;
};