'use strict';

module.exports = function (app) {
    var pub = {},
        repo = require('../repositories')(app.config.mongo.enterprise),
        syslog = app.logging.syslog,
        audit = app.logging.audit;

    /**
     * Gets all members from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllMembers = function (data, callback) {
        repo.crew.getAll(data.params || {}, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting all members from db: %j', error, data);
                callback({message: 'Could not load all members!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Gets a single member by id.
     *
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.getMemberById = function (data, callback) {
        data = data || {};

        repo.crew.getOneById(data.id, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting member from db: %s', error, data.id);
                callback({message: 'Could not load member!'});
                return;
            }

            callback({data: result});

        });
    };

    /**
     * Creates a new member in the db.
     *
     * @param {object} data The blog post data.
     * @param {!function(result)} callback The callback.
     */
    pub.createMember = function (data, callback) {
        data = data || {};

        // validate client data
        repo.crew.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating crew member: %j', error, data);
                callback({message: 'Could not create crew member!'});
                return;
            }

            if (result.valid) {
                // save in repo
                repo.crew.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating crew member in db: %j', error, data);
                        callback({message: 'Could not create crew member!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created crew member in db: %j', data);
                        callback({data: result[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Updates a member in the db.
     *
     * @param {object} data The member data.
     * @param {!function(result)} callback The callback.
     */
    pub.updateMember = function (data, callback) {
        if (!data) {
            callback({});
            return;
        }

        // validate client data
        repo.crew.validate(data, {isUpdate: true}, function (error, result) {
            if (error) {
                syslog.error('%s! validating member: %j', error, data);
                callback({message: 'Could not update member!'});
                return;
            }

            if (result.valid) {
                // save in repo
                repo.crew.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        syslog.error('%s! updating member in db: %j', error, data);
                        callback({message: 'Could not update member!'});
                        return;
                    }

                    if (result) {
                        audit.info('Updated member in db: %j', data);
                        callback({success: result});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Deletes a member.
     *
     * @param {object} data The data.
     * @param {string|object} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.deleteMember = function (data, callback) {
        data = data || {};

        repo.crew.delete({_id: data.id}, function (error, result) {
            if (error || result === 0) {
                syslog.error('%s! deleting member in db: %j', error, data);
                callback({message: 'Could not delete member!'});
                return;
            }

            if (result) {
                audit.info('Deleted member in db: %j', data);
                callback({success: result});
            }
        });
    };

    return pub;
};
