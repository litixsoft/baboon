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
     * Gets all roles and the number of roles from db.
     *
     * @roles Admin
     * @description Gets all roles and the number of roles from db.
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAll = function (data, callback) {
        async.auto({
            getAll: function (callback) {
                repo.roles.getAll(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.roles.getCount(data.params || {}, callback);
            }
        }, function (error, results) {
            if (error) {
                syslog.error('%s! getting all roles from db: %j', error, data);
                callback({message: 'Could not load all roles!'});
                return;
            }

            callback({data: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single role post by id.
     *
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     * @roles Admin
     * @description Gets a single role post by id.
     */
    pub.getById = function (data, callback) {
        data = data || {};

        repo.roles.getOneById(data.id, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting role from db: %s', error, data.id);
                callback({message: 'Could not load roles!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Creates a new role in the db.
     *
     * @roles Admin
     * @description Creates a new role in the db.
     * @param {object} data The role data.
     * @param {!function(result)} callback The callback.
     */
    pub.create = function (data, callback) {
        data = data || {};

        // validate client data
        repo.roles.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating role: %j', error, data);
                callback({message: 'Could not create role!'});
                return;
            }

            if (result.valid) {
                // save in repo
                repo.roles.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating role in db: %j', error, data);
                        callback({message: 'Could not create role!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created role in db: %j', data);
                        callback({data: result[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Updates a role in the db.
     *
     * @roles Admin
     * @description Updates a role in the db.
     * @param {object} data The role data.
     * @param {!function(result)} callback The callback.
     */
    pub.update = function (data, callback) {
        if (!data) {
            callback({});
            return;
        }

        // validate client data
        repo.roles.validate(data, {isUpdate: true}, function (error, result) {
            if (error) {
                syslog.error('%s! validating role: %j', error, data);
                callback({message: 'Could not update role!'});
                return;
            }

            if (result.valid) {

                // save in repo
                repo.roles.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        syslog.error('%s! updating role in db: %j', error, data);
                        callback({message: 'Could not update role!'});
                        return;
                    }

                    if (result) {
                        audit.info('Updated role in db: %j', data);
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