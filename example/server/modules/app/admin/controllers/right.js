'use strict';

var async = require('async');

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
     * Gets all rights and the number of rights from db.
     *
     * @roles Admin
     * @description Gets all rights and the number of rights from db
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, callback) {
        async.auto({
            getAll: function (callback) {
                repo.rights.getAll(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.rights.getCount(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single right by id.
     *
     * @roles Admin
     * @description Gets a single right by id
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, callback) {
        data = data || {};

        repo.rights.getOneById(data.id, data.options || {}, callback);
    };

    /**
     * Creates a new right in the db.
     *
     * @roles Admin
     * @description Creates a new right in the db
     * @param {object} data The right data.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, callback) {
        data = data || {};

        // validate client data
        repo.rights.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.rights.create(data, function (error, result) {
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
                callback({validation: result.errors});
            }
        });
    };

    /**
     * Updates a right in the db.
     *
     * @roles Admin
     * @description Updates a right in the db
     * @param {object} data The right data.
     * @param {!function(result)} callback The callback.
     */
    pub.update = function (data, callback) {
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
                callback({validation: result.errors});
            }
        });
    };

    return pub;
};