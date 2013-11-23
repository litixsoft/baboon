'use strict';

module.exports = function (app) {
    var pub = {},
        repo = require('../repositories')(app.config.mongo.enterprise),
        audit = app.logging.audit;

    /**
     * Gets all members from db.
     *
     * @roles Admin, Guest
     * @description Gets all members from db
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllMembers = function (data, request, callback) {
        repo.crew.find(data.params || {}, data.options || {}, callback);
    };

    /**
     * Gets a single member by id.
     *
     * @roles Admin, Guest
     * @description Gets a single member by id
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.getMemberById = function (data, request, callback) {
        data = data || {};

        repo.crew.findOneById(data.id, data.options || {}, callback);
    };

    /**
     * Creates a new member in the db.
     *
     * @roles Admin, Guest
     * @description Creates a new member in the db
     * @param {object} data The blog post data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.createMember = function (data, request, callback) {
        data = data || {};

        // validate client data
        repo.crew.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.crew.insert(data, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Created crew member in db: %j', data);
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    /**
     * Updates a member in the db.
     *
     * @roles Admin, Guest
     * @description Updates a member in the db
     * @param {object} data The member data.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.updateMember = function (data, request, callback) {
        if (!data) {
            callback();
            return;
        }

        // validate client data
        repo.crew.validate(data, {}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result.valid) {
                // save in repo
                repo.crew.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    if (result) {
                        audit.info('Updated member in db: %j', data);
                        callback(null, result);
                    }
                });
            } else {
                callback(new app.ValidationError(result.errors));
            }
        });
    };

    /**
     * Deletes a member.
     *
     * @roles Admin, Guest
     * @description Deletes a member
     * @param {object} data The data.
     * @param {string|object} data.id The id.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.deleteMember = function (data, request, callback) {
        data = data || {};

        repo.crew.remove({_id: data.id}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (typeof result === 'number') {
                audit.info('Deleted member in db: %j', data);
                callback(null, result);
            }
        });
    };

    /**
     * Create test members in crew collection.
     *
     * @roles Admin, Guest
     * @description Create test members in crew collection
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.createTestMembers = function (data, request, callback) {
        var testCrew = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'},
            {name: 'La Forge', description: 'Engineer'}
        ];

        // save in repo
        repo.crew.insert(testCrew, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result) {
                audit.info('Created test crew in db: %j', testCrew);
                callback(null, result);
            }
        });
    };

    /**
     * Delete all members in crew collection.
     * Generate test crew members in crew collection.
     *
     * @roles Admin, Guest
     * @description Delete all members in crew collection. Generate test crew members in crew collection
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.deleteAllMembers = function (data, request, callback) {
        repo.crew.remove({}, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            if (result) {
                audit.info('Deleted all crew members in db');
                callback(null, result);
            }
        });
    };

    return pub;
};
