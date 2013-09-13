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
        syslog = app.logging.syslog,
        audit = app.logging.audit;

    /**
     * Gets all groups and the number of groups from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, callback) {
        async.auto({
            getAll: function (callback) {
                repo.groups.getAll(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.groups.getCount(data.params || {}, callback);
            }
        }, function (error, results) {
            if (error) {
                syslog.error('%s! getting all groups from db: %j', error, data);
                callback({message: 'Could not load all groups!'});
                return;
            }

            callback({data: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single group post by id.
     *
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.getById = function (data, callback) {
        data = data || {};

        repo.groups.getOneById(data.id, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting group from db: %s', error, data.id);
                callback({message: 'Could not load group!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Creates a new group in the db.
     *
     * @param {object} data The group data.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, callback) {
        data = data || {};

        // validate client data
        repo.groups.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating group: %j', error, data);
                callback({message: 'Could not create group!'});
                return;
            }

            if (result.valid) {
                // save in repo
                repo.groups.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating group in db: %j', error, data);
                        callback({message: 'Could not create group!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created group in db: %j', data);
                        callback({data: result[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Updates a group in the db.
     *
     * @param {object} data The group data.
     * @param {!function(result)} callback The callback.
     */
    pub.update = function (data, callback) {
        if (!data) {
            callback({});
            return;
        }

        // validate client data
        repo.groups.validate(data, {isUpdate: true}, function (error, result) {
            if (error) {
                syslog.error('%s! validating group: %j', error, data);
                callback({message: 'Could not update group!'});
                return;
            }

            if (result.valid) {

                // save in repo
                repo.groups.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        syslog.error('%s! updating group in db: %j', error, data);
                        callback({message: 'Could not update group!'});
                        return;
                    }

                    if (result) {
                        audit.info('Updated group in db: %j', data);
                        callback({success: result});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    return pub;
};