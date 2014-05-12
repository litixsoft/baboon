'use strict';

var async = require('async');

/**
 * The role api.
 *
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (app) {
    var pub = {},
        repo = app.rights.getRepositories(),
        audit = app.loggers.audit;

    /**
     * Gets all roles and the number of roles from db.
     *
     * @roles
     * @description Gets all roles and the number of roles from db.
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, request, callback) {
        async.auto({
            getAll: function (callback) {
                repo.roles.find(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.roles.count(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single role post by id.
     *
     * @roles
     * @description Gets a single role post by id.
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, request, callback) {
        data = data || {};

        repo.roles.findOneById(data.id, data.options || {}, callback);
    };

    /**
     * Creates a new role in the db.
     *
     * @roles
     * @description Creates a new role in the db.
     * @param {object} data The role data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, request, callback) {
        data = data || {};

        // validate client data
        repo.roles.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.roles.insert(data, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Created role in db: %j', data);
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    /**
     * Updates a role in the db.
     *
     * @roles
     * @description Updates a role in the db.
     * @param {object} data The role data.
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
        repo.roles.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.roles.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Updated role in db: %j', data);
                        callback(null, result);
                    }
                });
            } else {
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    return pub;
};