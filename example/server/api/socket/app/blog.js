'use strict';

/**
 * The blog api.
 *
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (app) {
    var result = {},
        repo = require(app.config.path.repositories).blog(app.config.mongo.blog),
        syslog = app.logging.syslog,
        audit = app.logging.audit;

    /**
     * Gets all blog post from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    result.getAllPosts = function (data, callback) {
        repo.posts.getAll(data, function (error, result) {
            if (error) {
                syslog.error('%s! getting all blog posts from db: %j', error, data);
                callback({success: false, message: 'Could not load all blog posts!'});
                return;
            }

            callback({success: true, data: result});
        });
    };

    /**
     * Gets a single blog post by id.
     *
     * @param {!string} id The id.
     * @param {!function(result)} callback The callback.
     */
    result.getPostById = function (id, callback) {
        repo.posts.getOneById(id, function (error, result) {
            if (error) {
                syslog.error('%s! getting blog post from db: %s', error, id);
                callback({success: false, message: 'Could not load blog post!'});
                return;
            }

            callback({success: true, data: result});
        });
    };

    /**
     * Creates a new blog post in the db.
     *
     * @param {object} data The blog post data.
     * @param {!function(result)} callback The callback.
     */
    result.createPost = function (data, callback) {
        data = data || {};

        // validate client data
        repo.posts.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating blog post: %j', error, data);
                callback({success: false, message: 'Could not create blog post!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.created = new Date();

                // save in repo
                repo.posts.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating blog post in db: %j', error, data);
                        callback({success: false, message: 'Could not create blog post!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created blog post in db: %j', data);
                        callback({success: true, data: result[0]});
                    }
                });
            } else {
                callback({success: false, errors: result.errors});
            }
        });
    };

    /**
     * Updates a blog post in the db.
     *
     * @param {object} data The blog post data.
     * @param {!function(result)} callback The callback.
     */
    result.updatePost = function (data, callback) {
        data = data || {};

        // validate client data
        repo.posts.validate(data, {isUpdate: true}, function (error, result) {
            if (error) {
                syslog.error('%s! validating blog post: %j', error, data);
                callback({success: false, message: 'Could not update blog post!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.modified = new Date();

                // save in repo
                repo.posts.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error) {
                        syslog.error('%s! updating blog post in db: %j', error, data);
                        callback({success: false, message: 'Could not update blog post!'});
                        return;
                    }

                    if (result) {
                        audit.info('Updated blog post in db: %j', data);
                        callback({success: true});
                    }
                });
            } else {
                callback({success: false, errors: result.errors});
            }
        });
    };

//    // register resources
//    base.register(acl.name, socket, acl, pub);
    return result;
};