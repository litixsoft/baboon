'use strict';

var async = require('async');
var lxHelpers = require('lx-helpers');

/**
 * Returns the settings module.
 *
 * @param {!Object} config The config.
 * @param {!Object} config.mongo The mongo Object with the connection strings.
 * @param {!Object} config.path The path object with all app paths.
 * @param {!Object} logging The logging object.
 * @param {!Object} logging.syslog The syslogger.
 * @param {!Object} rights The rights system object.
 * @returns {{}}
 */
module.exports = function (config, logging, rights) {
    var pub = {};

    /**
     * Saves the settings of the user in the file system.
     *
     * @param {!Object} user The user object.
     * @param {Object} settings The settings object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    function saveSettingsToFile (user, settings, callback) {
        // save settings in file system (file is named after the user name, e.g. guest.json)
        var fs = require('fs');
        var path = require('path');
        var folder = path.join(config.path.settings);

        async.waterfall([
            function (next) {
                fs.exists(config.path.appFolder, function (result) {
                    next(null, result);
                });
            },
            function (folderExists, next) {
                if (!folderExists) {
                    fs.mkdir(config.path.appFolder, next);
                } else {
                    next();
                }
            },
            function (next) {
                fs.exists(folder, function (result) {
                    next(null, result);
                });
            },
            function (folderExists, next) {
                if (!folderExists) {
                    fs.mkdir(folder, next);
                } else {
                    next();
                }
            },
            function (next) {
                fs.writeFile(path.join(folder, user.name + '.json'), JSON.stringify(settings), next);
            }
        ], function (error) {
            callback(error, true);
        });
    }

    /**
     * Returns the settings of the current user.
     *
     * @param {!Object} user The user object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     * @returns {{}}
     */
    pub.getUserSettings = function (user, callback) {
        // check params
        if (!lxHelpers.isObject(user)) {
            return callback(lxHelpers.getTypeError('user', user, {}));
        }

        if (config.useRightsSystem === false) {
            // get settings from json file
            require('fs').readFile(require('path').join(config.path.settings, user.name + '.json'), {encoding: 'utf-8'}, function (error, result) {
                try {
                    var settings = JSON.parse(result || '{}');
                    callback(null, settings);
                }
                catch (e) {
                    logging.syslog.warn('settings: Cannot parse settings file: %s', require('path').join(config.path.settings, user.name + '.json'));
                    callback(null, {});
                }
            });
        } else {
            // get settings from db
            var repo = rights.getRepositories().users;

            repo.findOneById(user._id, {fields: ['settings']}, function (error, result) {
                if (!result) {
                    logging.syslog.warn('settings: user not found: %j', user);
                    result = {};
                }

                callback(error, result.settings || {});
            });
        }
    };

    /**
     * Returns the settings of the user of the current request.
     *
     * @param {!Object} request The request object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     * @returns {{}}
     */
    pub.getUserSettingsFromRequest = function (request, callback) {
        if (!lxHelpers.isObject(request) || !lxHelpers.isFunction(request.getSession)) {
            return callback(new TypeError('Param request is missing or has no function getSession()'));
        }

        async.waterfall([
            function (next) {
                request.getSession(next);
            },
            function (req, next) {
                pub.getUserSettings(req.user, next);
            }
        ], callback);
    };

    /**
     * Saves a single setting for the current user.
     *
     * @param {!Object} user The user object.
     * @param {!{key: string, value: *}} setting The setting to save.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSetting = function (user, setting, callback) {
        // check params
        if (!lxHelpers.isObject(user)) {
            return callback(lxHelpers.getTypeError('user', user, {}));
        }

        if (!lxHelpers.isObject(setting) || !lxHelpers.isString(setting.key)) {
            return callback(new TypeError('Param setting is missing or has no/wrong property key'));
        }

        if (config.useRightsSystem === false) {
            // get current settings from json file
            pub.getUserSettings(user, function (error, result) {
                if (error) {
                    return callback(error);
                }

                // add the new setting
                result[setting.key] = setting.value;

                // save settings
                saveSettingsToFile(user, result, callback);
            });
        } else {
            // save settings in db
            var repo = rights.getRepositories().users;

            repo.findOneById(user._id, {fields: ['settings']}, function (error, result) {
                if (error) {
                    return callback(error);
                }

                if (result) {
                    result.settings = result.settings || {};
                    result.settings[setting.key] = setting.value;

                    repo.update({_id: user._id}, {$set: {settings: result.settings}}, callback);
                } else {
                    callback(null, {});
                }
            });
        }
    };

    /**
     * Saves a single setting for the user of the current request.
     *
     * @param {!Object} request The request object.
     * @param {!{key: string, value: *}} setting The setting to save.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSettingFromRequest = function (request, setting, callback) {
        // check params
        if (!lxHelpers.isObject(request) || !lxHelpers.isFunction(request.getSession)) {
            return callback(new TypeError('Param request is missing or has no function getSession()'));
        }

        async.waterfall([
            function (next) {
                request.getSession(next);
            },
            function (req, next) {
                pub.setUserSetting(req.user, setting, next);
            }
        ], callback);
    };

    /**
     * Saves the settings for the current user.
     *
     * @param {!Object} user The user object.
     * @param {!{key: string, value: *}} settings The settings object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSettings = function (user, settings, callback) {
        // check params
        if (!lxHelpers.isObject(user)) {
            return callback(lxHelpers.getTypeError('user', user, {}));
        }

        if (!lxHelpers.isObject(settings)) {
            return callback(new TypeError('Param setting is missing'));
        }

        if (config.useRightsSystem === false) {
            // save settings in file system (file is named after the user name, e.g. guest.json)
            saveSettingsToFile(user, settings, callback);
        } else {
            // save settings in db
            var repo = rights.getRepositories().users;
            repo.update({_id: user._id}, {$set: {settings: settings}}, callback);
        }
    };

    /**
     * Saves the settings for the user of the current request.
     *
     * @param {!Object} request The request object.
     * @param {!{key: string, value: *}} settings The settings object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.setUserSettingsFromRequest = function (request, settings, callback) {
        // check params
        if (!lxHelpers.isObject(request) || !lxHelpers.isFunction(request.getSession)) {
            return callback(new TypeError('Param request is missing or has no function getSession()'));
        }

        async.waterfall([
            function (next) {
                request.getSession(next);
            },
            function (req, next) {
                pub.setUserSettings(req.user, settings, next);
            }
        ], callback);
    };

    return pub;
};