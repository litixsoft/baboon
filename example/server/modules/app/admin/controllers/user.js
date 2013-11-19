'use strict';

var async = require('async'),
    pwd = require('pwd'),
    lxHelpers = require('lx-helpers'),
    protectedFields = ['hash', 'salt'];

function createHash (user, callback) {
    if (user.password) {
        pwd.hash(user.password, function (error, salt, hash) {
            if (error) {
                callback(error);
            }

            user.salt = salt;
            user.hash = hash;

            callback(null, user);
        });
    } else {
        callback(null, user);
    }
}

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
 * The blog api.
 *
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (app) {
    var pub = {},
        repo = app.rights.getRepositories(),
        audit = app.logging.audit;

    /**
     * Gets all users and the number of users from db.
     *
     * @roles Admin
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
                repo.users.getAll(data.params || {}, options, callback);
            },
            getCount: function (callback) {
                repo.users.getCount(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single user by id.
     *
     * @roles Admin
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
        repo.users.getOneById(data.id, options, callback);
    };

    /**
     * Creates a new user in the db.
     *
     * @roles Admin
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
                async.auto({
                    createPasswordHash: function (next) {
                        createHash(data, next);
                    },
                    createUser: ['createPasswordHash', function (next) {
                        // do not save password and confirmedPassword
                        delete data.password;
                        delete data.confirmedPassword;

                        repo.users.create(data, next);
                    }]
                }, function (error, results) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (results.createUser[0]) {
                        // remove protected fields
                        lxHelpers.forEach(protectedFields, function (field) {
                            delete results.createUser[0][field];
                        });

                        audit.info('Created user in db: %j', data);
                        callback(null, results.createUser[0]);
                    }
                });
            } else {
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    /**
     * Updates a user in the db.
     *
     * @roles Admin
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
                        createHash(data, next);
                    },
                    updateUser: ['createPasswordHash', function (next) {
                        // do not save password and confirmedPassword
                        delete data.password;
                        delete data.confirmedPassword;

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
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    return pub;
};