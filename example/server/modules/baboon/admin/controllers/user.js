'use strict';

var async = require('async'),
    pwd = require('pwd'),
    lxHelpers = require('lx-helpers'),
    protectedFields = ['hash', 'salt'];

function createHash (user, password, callback) {
    if (password) {
        pwd.hash(password, function (error, salt, hash) {
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
        repo = app.rights.getRepositories(app),
        syslog = app.logging.syslog,
        audit = app.logging.audit;

    /**
     * Gets all users and the number of users from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, callback) {
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
            if (error) {
                syslog.error('%s! getting all users from db: %j', error, data);
                callback({message: 'Could not load all users!'});
                return;
            }

            callback({data: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single user post by id.
     *
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, callback) {
        var options = data.options || {};

        // remove protected fields from options.fields
        removeProtectedFields(options);

        // query user
        repo.users.getOneById(data.id, options, function (error, result) {
            if (error) {
                syslog.error('%s! getting user from db: %s', error, data.id);
                callback({message: 'Could not load user!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Creates a new user in the db.
     *
     * @param {object} data The user data.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, callback) {
        data = data || {};
        var password = data.password;

        // validate client data
        repo.users.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating user: %j', error, data);
                callback({message: 'Could not create user!'});
                return;
            }

            if (result.valid) {
                async.auto({
                    createPasswordHash: function (next) {
                        createHash(data, password, next);
                    },
                    createUser: ['createPasswordHash', function (next) {
                        repo.users.create(data, next);
                    }]
                }, function (error, results) {
                    if (error) {
                        syslog.error('%s! creating user in db: %j', error, data);
                        callback({message: 'Could not create user!'});
                        return;
                    }

                    if (results.createUser[0]) {
                        // remove protected fields
                        lxHelpers.forEach(protectedFields, function (field) {
                            delete results.createUser[0][field];
                        });

                        audit.info('Created user in db: %j', data);
                        callback({data: results.createUser[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Updates a user in the db.
     *
     * @param {object} data The user data.
     * @param {!function(result)} callback The callback.
     */
    pub.update = function (data, callback) {
        if (!data) {
            callback({});
            return;
        }

        var password = data.password;

        // validate client data
        repo.users.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating user: %j', error, data);
                callback({message: 'Could not create user!'});
                return;
            }

            if (result.valid) {
                async.auto({
                    createPasswordHash: function (next) {
                        createHash(data, password, next);
                    },
                    updateUser: ['createPasswordHash', function (next) {
                        repo.users.update({_id: data._id}, {$set: data}, next);
                    }]
                }, function (error, results) {
                    if (error || results.updateUser[0] === 0) {
                        syslog.error('%s! updating user in db: %j', error, data);
                        callback({message: 'Could not update user!'});
                        return;
                    }

                    if (results.updateUser[0]) {
                        audit.info('Updated user in db: %j', data);
                        callback({success: results.updateUser[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    return pub;
};