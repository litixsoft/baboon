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
    var pub = {},
        repo = require(app.config.path.repositories).blog(app.config.mongo.blog),
        syslog = app.logging.syslog,
        audit = app.logging.audit;

    /**
     * Gets all blog post from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllPosts = function (data, callback) {
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
    pub.getPostById = function (id, callback) {
        repo.posts.getOneById(id, function (error, result) {
            if (error) {
                syslog.error('%s! getting blog post from db: %s', error, id);
                callback({success: false, message: 'Could not load blog post!'});
                return;
            }

            if (result) {
                var post = result;

                if (post.comments && post.comments.length > 0) {
                    repo.comments.getAll({_id: {$in: post.comments}}, function (error, result) {
                        if (error) {
                            syslog.error('%s! getting blog post from db: %s', error, id);
                            callback({success: false, message: 'Could not load blog post!'});
                            return;
                        }

                        post.comments = result;

                        callback({success: true, data: post});
                    });
                } else {
                    callback({success: true, data: post});
                }
            }
        });
    };

    /**
     * Creates a new blog post in the db.
     *
     * @param {object} data The blog post data.
     * @param {!function(result)} callback The callback.
     */
    pub.createPost = function (data, callback) {
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
    pub.updatePost = function (data, callback) {
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

    pub.addComment = function (data, callback) {
        data = data || {};
        var postId = data.post_id;

        // validate client data
        repo.comments.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating comment: %j', error, data);
                callback({success: false, message: 'Could not create comment!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.created = new Date();

                // save in repo
                repo.comments.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating comment in db: %j', error, data);
                        callback({success: false, message: 'Could not create comment!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created comments in db: %j', data);
                        callback({success: true, data: result[0]});

                        repo.posts.update({_id: postId}, {$push: {comments: result[0]._id}}, function (error) {
                            if (error) {
                                syslog.error('%s! creating comment in db: %j', error, data);
                                callback({success: false, message: 'Could not create comment!'});
                            }
                        });
                    }
                });
            } else {
                callback({success: false, errors: result.errors});
            }
        });
    };

    return pub;
};