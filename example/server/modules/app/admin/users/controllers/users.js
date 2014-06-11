'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers'),
    protectedFields = ['password', 'salt'],
    secretUsers = ['sysadmin'];


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

function removeSecretUsers (params) {
    params.$and = params.$and || [];
    lxHelpers.forEach(secretUsers, function (field) {
        params.$and.push({name: {$ne: field}});
    });
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
        audit = baboon.loggers.audit,
        crypto = baboon.crypto;

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
        var params = data.params || {};

        // remove protected fields from options.fields
        removeProtectedFields(options);
        // remove sysadmin user
        removeSecretUsers(params);

        async.auto({
            getAll: function (callback) {
                repo.users.find(params, options, callback);
            },
            getCount: function (callback) {
                repo.users.count(params, callback);
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
        repo.users.findOneById(data.id, options, function(error, result) {
            if (result && secretUsers.indexOf(result.name) > -1) {
                result = null;
            }
            callback(error, result);
        });
    };

    /**
     * Gets a single user by id and all groups, roles and rights.
     *
     * @roles Admin
     * @description Gets a single user by id and all groups, roles and rights.
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getUserData = function (data, request, callback) {
        async.auto({
            getUser: function (next) {
                if (data.id) {
                    pub.getById(data, request, next);
                } else {
                    next();
                }
            },
            getGroups: function (next) {
                repo.groups.find({}, {sort: {name: 1}}, next);
            },
            getRoles: function (next) {
                repo.roles.find({}, {sort: {name: 1}}, next);
            },
            getRights: function (next) {
                repo.rights.find({}, {sort: {name: 1}, fields: {controller: 0}}, next);
            }
        }, function (error, result) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, {user: result.getUser, groups: result.getGroups, roles: result.getRoles, rights: result.getRights});
                }
            }
        );
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
                crypto.hashWithRandomSalt(data.password, function (error, result) {
                    data.password = result.password;
                    data.salt = result.salt;

                    repo.users.createUser(data, callback);
                });
            } else {
                callback(new baboon.ValidationError(result.errors, 500, true));
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
                    updateUser: [function (next) {
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

    /**
     * Deletes a user in the db.
     *
     * @roles Admin
     * @description Deletes a user in the db.
     * @param {object} data The user data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.remove = function(data, request, callback) {
        if (!data || !data.id) {
            callback();
            return;
        }

        repo.users.remove({ _id: data.id }, callback);
    };

    return pub;
};