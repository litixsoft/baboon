'use strict';

var async = require('async');

/**
 * The group api.
 *
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (baboon) {
    var pub = {},
        repo = baboon.rights.getRepositories(),
        audit = baboon.loggers.audit;

    /**
     * Gets all groups and the number of groups from db.
     *
     * @roles Admin
     * @description Gets all groups and the number of groups from db
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, request, callback) {
        async.auto({
            getAll: function (callback) {
                repo.groups.find(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.groups.count(data.params || {}, callback);
            }
        }, function (error, results) {
            callback(error, {items: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single group post by id.
     *
     * @roles Admin
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     * @description Gets a single group post by id
     */
    pub.getById = function (data, request, callback) {
        data = data || {};

        repo.groups.findOneById(data.id, data.options || {}, callback);
    };

    /**
     * Creates a new group in the db.
     *
     * @roles Admin
     * @description Creates a new group in the db
     * @param {object} data The group data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, request, callback) {
        data = data || {};

        // validate client data
        repo.groups.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.groups.insert(data, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Created group in db: %j', data);
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(new baboon.ValidationError(result.errors));
            }
        });
    };

    /**
     * Updates a group in the db.
     *
     * @roles Admin
     * @description Updates a group in the db
     * @param {object} data The group data.
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
        repo.groups.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.groups.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Updated group in db: %j', data);
                        callback(null, result);
                    }
                });
            } else {
                callback(new baboon.ValidationError(result.errors));
            }
        });
    };

    /**
     * Deletes a group in the db.
     *
     * @roles Admin
     * @description Updates a group in the db
     * @param {object} data The group data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.remove = function(data, request, callback) {
        if (!data || !data.id) {
            callback();
            return;
        }

        var options = { limit: 1, fields: ['_id'] };
        var convertedId = repo.users.convertId(data.id);

        repo.users.find({ 'groups' : convertedId }, options, function(error, result) {
            if(error) {
                callback(callback);
                return;
            }

            if(result.length > 0) {
                callback(new baboon.ControllerError('GROUP_USED', 500, true, '', ''));
                return;
            }

            repo.groups.remove({ _id: data.id }, callback);
        });
    };

    return pub;
};