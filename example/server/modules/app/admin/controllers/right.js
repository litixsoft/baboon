'use strict';

var async = require('async');

/**
 * The right api.
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
     * Gets all rights and the number of rights from db.
     *
     * @roles
     * @description Gets all rights and the number of rights from db
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, request, callback) {
        async.auto({
            getAll: function (callback) {
                repo.rights.find(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.rights.count(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single right by id.
     *
     * @roles
     * @description Gets a single right by id
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, request, callback) {
        data = data || {};

        repo.rights.findOneById(data.id, data.options || {}, callback);
    };

    /**
     * Creates a new right in the db.
     *
     * @roles
     * @description Creates a new right in the db
     * @param {object} data The right data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, request, callback) {
        data = data || {};

        // validate client data
        repo.rights.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.rights.insert(data, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Created right in db: %j', data);
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(new baboon.ValidationError(result.errors));
            }
        });
    };

    /**
     * Updates a right in the db.
     *
     * @roles
     * @description Updates a right in the db
     * @param {object} data The right data.
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
        repo.rights.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {

                // save in repo
                repo.rights.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Updated right in db: %j', data);
                        callback(null, result);
                    }
                });
            } else {
                callback(new baboon.ValidationError(result.errors));
            }
        });
    };

    return pub;
};