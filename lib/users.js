'use strict';

/**
 * Returns the users module.
 *
 * @param {!Object} config The config.
 * @param {!Object} logging The logging object.
 * @return {Object} An object with methods for working with users.
 */
module.exports = function (config, logging) {
    if (typeof config !== 'object') {
        throw new TypeError('Parameter config is required and must be of type object.');
    }

    if (typeof config.rights !== 'object') {
        throw new TypeError('Parameter config.rights is required and must be of type object.');
    }

    if (typeof logging !== 'object') {
        throw new TypeError('Parameter logging is required and must be of type object.');
    }

    var repo = require('./repositories')(config.rights.database).users;
    //var lxHelpers = require('lx-helpers');

    var pub = {};

    /**
     * Gets the user object with login data.
     *
     * @param {String} name The name of the user.
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    pub.getUserForLogin = function (name, callback) {
        repo.findOne({name: name}, {fields: ['name', 'hash', 'salt']}, function (error, result) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error.toString(), name);
                callback(error);
                return;
            }

            callback(null, result);
        });
    };

    return pub;
};