'use strict';

var async = require('async');
var lxHelpers = require('lx-helpers');
var validator = require('lx-valid');
var fs = require('fs');
var path = require('path');
var SettingsError = require('./errors').SettingsError;
var ValidationError = require('./errors').ValidationError;

/**
 * Returns the settings module.
 *
 * @param {!Object} baboon The baboon app object.
 * @param {!Object} baboon.config The config.
 * @param {!Object} baboon.config.mongo The mongo Object with the connection strings.
 * @param {!Object} baboon.config.path The path object with all app paths.
 * @param {!Object} baboon.loggers The loggers object.
 * @param {!Object} baboon.loggers.syslog The syslogger.
 * @param {!Object} baboon.rights The rights system object.
 * @returns {{}}
 */
module.exports = function (baboon) {
    var pub = {};
    var settingsFolder = path.join(baboon.config.path.appFolder, 'config');
    var defaultClientSettingsFile = path.join(baboon.config.path.root, 'client_settings.js');
    var defaultClientSettings = {};
    var defaultClientSettingsSchema;
    var validationOptions = {
        // deletes all properties not defined in the json schema
        deleteUnknownProperties: true,
        // function to convert the values with a format to a value that mongoDb can handle (e.g dates, ObjectID)
        convert: function (format, value) {
            if (format === 'date-time' || format === 'date') {
                return new Date(value);
            }

            return value;
        },
        // trim all values which are in schema and of type 'string'
        trim: true,
        // handle empty string values as invalid when they are required in schema
        strictRequired: true
    };

    // try to load default client settings
    if (fs.existsSync(defaultClientSettingsFile)) {
        try {
            defaultClientSettings = require(defaultClientSettingsFile).settings;
            defaultClientSettingsSchema = require(defaultClientSettingsFile).schema;
        }
        catch (e) {
            baboon.loggers.syslog.warn('settings: Cannot parse default client settings file: %s', defaultClientSettingsFile);
        }
    }

    /**
     * Saves the settings of the user in the file system.
     *
     * @param {!Object} user The user object.
     * @param {Object} settings The settings object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    function saveSettingsToFile (user, settings, callback) {
        // save settings in file system (file is named after the user name, e.g. guest.json)

        async.waterfall([
            function (next) {
                fs.exists(settingsFolder, function (result) {
                    next(null, result);
                });
            },
            function (folderExists, next) {
                if (!folderExists) {
                    fs.mkdir(settingsFolder, next);
                } else {
                    next();
                }
            },
            function (next) {
                fs.writeFile(path.join(settingsFolder, user.name + '.json'), JSON.stringify(settings), next);
            }
        ], function (error) {
            callback(error, true);
        });
    }

//    function getSetting (key, settings, callback) {
//        if (settings && settings.hasOwnProperty(key)) {
//            return callback(null, settings[key]);
//        } else {
//            return callback(new SettingsError('Setting with key %s not found', key));
//        }
//    }

    /**
     * Returns the settings of the current user.
     *
     * @param {Object} data The data object.
     * @param {!Object} request The request object.
     * @param {!Object} request.session The session object.
     * @param {!Object} request.session.user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     * @returns {{}}
     */
    pub.getUserSettings = function (data, request, callback) {
        // check params
        if (!lxHelpers.isObject(request.session)) {
            return callback(new SettingsError(lxHelpers.getTypeError('session', request.session, {}).message));
        }

        if (baboon.config.rights.enabled) {
            // check if settings are already in session
            if (request.session.user.settings) {
                return callback(null, request.session.user.settings);
            }

            // return default client settings for guest user
            if (request.session.user.name === 'guest') {
                return callback(null, lxHelpers.clone(defaultClientSettings));
            }

            // get settings from db
            var repo = baboon.rights.getRepositories().users;

            repo.findOneById(request.session.user._id, {fields: ['settings']}, function (error, result) {
                if (error) {
                    return callback(new SettingsError('Error while loading the settings'));
                }

                if (!result) {
                    baboon.loggers.syslog.warn('settings: user not found: %j', request.session.user);
                    result = {
                        settings: lxHelpers.clone(defaultClientSettings)
                    };
                }

                callback(null, result.settings || lxHelpers.clone(defaultClientSettings));
            });
        } else {
            // try to load current user settings file
            fs.readFile(path.join(settingsFolder, request.session.user.name + '.json'), {encoding: 'utf-8'}, function (error, result) {
                if (error) {
                    baboon.loggers.syslog.error('settings: Error loading settings file: %s', path.join(settingsFolder, request.session.user.name + '.json'));
                    baboon.loggers.syslog.error(error);

                    // return default client settings
                    callback(null, lxHelpers.clone(defaultClientSettings));
                } else {
                    try {
                        var settings = JSON.parse(result);
                        callback(null, settings);
                    }
                    catch (e) {
                        baboon.loggers.syslog.warn('settings: Cannot parse settings file: %s', path.join(settingsFolder, request.session.user.name + '.json'));
                        callback(null, lxHelpers.clone(defaultClientSettings));
                    }
                }
            });
        }
    };

    /**
     * Returns a single setting of the current user.
     *
     * @param {Object} data The data object.
     * @param {String} data.key The key of the setting.
     * @param {!Object} request The request object.
     * @param {!Object} request.session The session object.
     * @param {!Object} request.session.user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     * @returns {{}}
     */
    pub.getUserSetting = function (data, request, callback) {
        // check params
        if (!lxHelpers.isObject(request.session)) {
            return callback(new SettingsError(lxHelpers.getTypeError('session', request.session, {}).message));
        }

        if (!lxHelpers.isObject(data) || !lxHelpers.isString(data.key) || data.key.length < 1) {
            return callback(new SettingsError('Param data is missing or has no/wrong/empty property key'));
        }

        pub.getUserSettings(null, request, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (result && result.hasOwnProperty(data.key)) {
                return callback(null, result[data.key]);
            } else {
                return callback(new SettingsError('Setting with key %s not found', data.key));
            }
        });
    };

    /**
     * Saves a single setting for the current user.
     *
     * @param {!{key: string, value: *}} data The setting to save.
     * @param {!Object} request The request object.
     * @param {!Object} request.session The session object.
     * @param {!Object} request.session.user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSetting = function (data, request, callback) {
        // check params
        if (!lxHelpers.isObject(request.session)) {
            return callback(new SettingsError(lxHelpers.getTypeError('session', request.session, {}).message));
        }

        if (!lxHelpers.isObject(data) || !lxHelpers.isString(data.key) || data.key.length < 1) {
            return callback(new SettingsError('Param data is missing or has no/wrong/empty property key'));
        }

        // get current settings from json file
        pub.getUserSettings(null, request, function (error, result) {
            if (error) {
                return callback(error);
            }

            // add the new setting
            result[data.key] = data.value;

            // save settings
            pub.setUserSettings(result, request, callback);
        });
    };

    /**
     * Saves the settings for the current user.
     *
     * @param {!Object} data The setting to save.
     * @param {!Object} request The request object.
     * @param {!Object} request.session The session object.
     * @param {!Object} request.session.user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSettings = function (data, request, callback) {
        if (!lxHelpers.isObject(request.session)) {
            return callback(new SettingsError(lxHelpers.getTypeError('session', request.session, {}).message));
        }

        if (!lxHelpers.isObject(data)) {
            return callback(new SettingsError(lxHelpers.getTypeError('data', data, {}).message));
        }

        // validate settings
        if (defaultClientSettingsSchema) {
            var validation = validator.validate(data, defaultClientSettingsSchema, validationOptions);

            if (!validation.valid) {
                return callback(new ValidationError(validation.errors));
            }
        }

        if (baboon.config.rights.enabled) {
            // save settings in session
            request.session.user.settings = data;

            // save settings in db when not guest user
            if (request.session.user.name !== 'guest') {
                var repo = baboon.rights.getRepositories().users;
                repo.update({_id: request.session.user._id}, {$set: {settings: data}}, function (error, result) {
                    if (error) {
                        callback(error);
                    } else {
                        if (result === 0) {
                            callback(new SettingsError('Cannot save settings. User not found: ' + JSON.stringify(request.session.user)));
                        } else {
                            callback(null, true);
                        }
                    }
                });
            } else {
                callback(null, true);
            }
        } else {
            // save settings in file system (file is named after the user name, e.g. guest.json)
            saveSettingsToFile(request.session.user, data, callback);
        }
    };

    /**
     * Resets the settings of the current user to the default client settings.
     *
     * @param {Object} data The data object.
     * @param {!Object} request The request object.
     * @param {!Object} request.session The session object.
     * @param {!Object} request.session.user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.resetUserSettings = function (data, request, callback) {
        pub.setUserSettings(defaultClientSettings, request, callback);
    };

    return pub;
};