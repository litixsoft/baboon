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
            },
            mail: {
                /*
                    host - hostname of the SMTP server (defaults to "localhost")
                    port - port of the SMTP server (defaults to 25, not needed with service)
                    useSsl - use SSL (default is false). If you're using port 587 then keep secureConnection false, since the connection is started in insecure plain text mode and only later upgraded with STARTTLS
                    auth - authentication object as {user:"...", pass:"..."} or {XOAuth2: {xoauth2_options}} or {XOAuthToken: "base64data"}
                    ignoreTLS - ignore server support for STARTTLS (defaults to false)
                    debug - output client and server messages to console
                    maxConnections - how many connections to keep in the pool (defaults to 5)
                    maxMessages - limit the count of messages to send through a single connection (no limit by default)
                */
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
    config.e2eTest = function() {

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
    config.e2eProductionTest = function() {

        // Config contains all settings from development.
        var settings = config.development();

        // overwrite the settings for this configuration
        settings.port = 3003;
        settings.node_env = 'production';

        return settings;
    };

    return config;
};