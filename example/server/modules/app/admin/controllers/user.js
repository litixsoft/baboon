'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers'),
    protectedFields = ['hash', 'salt'],
    crypto = require('crypto');

function removeProtectedFields (options) {
    if (!options.fields || lxHelpers.isEmpty(options.fields)) {
        options.fields = {};

        lxHelpers.forEach(protectedFields, function (field) {
            options.fields[field] = 0;
        });

        return;
    }

    if (lxHelpers.isObject(options.fields)) {
        lxHelpers.forEach(protectedFields, function (field) {
            options.fields[field] = 0;
        });

        return;
    }

    if (lxHelpers.isArray(options.fields)) {
        lxHelpers.forEach(protectedFields, function (field) {
            lxHelpers.arrayRemoveItem(options.fields, field);
        });
    }
}

/**
 * The user api.
 *
 * @param {!object} baboon The baboon baboon.
 * @param {!object} baboon.config The baboon baboon config.
 * @param {!object} baboon.logging.syslog The baboon baboon syslog.
 * @param {!object} baboon.logging.audit The baboon baboon audit log.
 */
module.exports = function (baboon) {
    var pub = {},
        repo = baboon.rights.getRepositories(),
        audit = baboon.loggers.audit;

    /**
     * Gets all users and the number of users from db.
     *
     * @roles
     * @description Gets all users and the number of users from db
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, request, callback) {
        var options = data.options || {};

        // remove protected fields from options.fields
        removeProtectedFields(options);

        async.auto({
            getAll: function (callback) {
                repo.users.find(data.params || {}, options, callback);
            },
            getCount: function (callback) {
                repo.users.count(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single user by id.
     *
     * @roles
     * @description Gets a single user by id
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, request, callback) {
        var options = data.options || {};

        // remove protected fields from options.fields
        removeProtectedFields(options);

        // query user
        repo.users.findOneById(data.id, options, callback);
    };

    /**
     * Creates a new user in the db.
     *
     * @roles
     * @description Creates a new user in the db
     * @param {object} data The user data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, request, callback) {
        data = data || {};

        // validate client data
        repo.users.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                repo.users.createUser(data, callback);
            } else {
                callback(new baboon.ValidationError(result.errors, 500, true));
            }
        });
    };

    /**
     * Updates a user in the db.
     *
     * @roles
     * @description Updates a user in the db
     * @param {object} data The user data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.update = function (data, request, callback) {
        if (!data) {
            callback();
            return;
        }

        // validate client data
        repo.users.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                async.auto({
                    createPasswordHash: function (next) {
                        crypto.hashWithRandomSalt( data.password, next);
                    },
                    updateUser: ['createPasswordHash', function (next) {
                        // do not save password and confirmed_password
                        delete data.password;
                        delete data.confirmed_password;

                        repo.users.update({_id: data._id}, {$set: data}, next);
                    }]
                }, function (error, results) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (results.updateUser[0]) {
                        audit.info('Updated user in db: %j', data);
                        callback(null, results.updateUser[0]);
                    }
                });
            } else {
                callback(new baboon.ValidationError(result.errors));
            }
        });
    };

    return pub;
};