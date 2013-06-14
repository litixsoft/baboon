'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers'),
    val = require('lx-valid');

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

    function updateTagCount () {
        async.auto({
            getAllTags: function (callback) {
                repo.tags.getAll({}, {fields: ['_id']}, callback);
            },
            getAllPostsWithTags: function (callback) {
                repo.posts.getAll({ tags: { $exists: true}}, {fields: ['tags']}, callback);
            },
            calculateTagCount: ['getAllTags', 'getAllPostsWithTags', function (callback, results) {
                var tags = {};

                if (results.getAllTags.length === 0 || results.getAllPostsWithTags.length === 0) {
                    callback();
                }

                // normalize tags array to tags object with count
                lxHelpers.arrayForEach(results.getAllTags, function (item) {
                    tags[item._id.toHexString()] = {
                        count: 0
                    };
                });

                // get number of tag usages
                lxHelpers.arrayForEach(results.getAllPostsWithTags, function (post) {
                    lxHelpers.arrayForEach(post.tags, function (tagId) {
                        var id = tagId.toHexString();

                        if (tags[id]) {
                            tags[id].count++;
                        } else {
                            tags[id] = {
                                count: 1
                            };
                        }
                    });
                });

                async.each(Object.keys(tags), function (item, innerCallback) {
                    repo.tags.update({_id: item}, {$set: {count: tags[item].count}}, innerCallback);
                }, callback);
            }]
        }, function (error) {
            if (error) {
                syslog.error('%s! setting count of tags: updateTagCount()', error);
            }
        });
    }

    /**
     * Gets all blog post from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllPosts = function (data, callback) {
        repo.posts.getAll(data.params || {}, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting all blog posts from db: %j', error, data);
                callback({message: 'Could not load all blog posts!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Gets all blog post and the number of blog posts from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllPostsWithCount = function (data, callback) {
        async.auto({
            getAll: function (callback) {
                repo.posts.getAll(data.params || {}, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.posts.getCount(data.params || {}, callback);
            }
        }, function (error, results) {
            if (error) {
                console.log(error);
                syslog.error('%s! getting all blog posts from db: %j', error, data);
                callback({message: 'Could not load all blog posts!'});
                return;
            }

            callback({data: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets all blog post and the number of blog posts from db.
     *
     * @param {object} data The query.
     * @param {string=} data.params The values for searching.
     * @param {object=} data.options The mongo filter options.
     * @param {!function(result)} callback The callback.
     */
    pub.searchPosts = function (data, callback) {
        var filter = {};
        data.params = data.params || {};

        if (data.params && typeof data.params === 'string') {
            if (val.types.mongoId(data.params).valid) {
                filter = {
                    tags: repo.posts.convertId(data.params)
                };
            } else {
                var searchValue = new RegExp(data.params, 'gi');

                filter = {
                    $or: [
                        { title: searchValue },
                        { content: searchValue }
                    ]
                };
            }
        }

        async.auto({
            getAll: function (callback) {
                repo.posts.getAll(filter, data.options || {}, callback);
            },
            getCount: function (callback) {
                repo.posts.getCount(filter, callback);
            }
        }, function (error, results) {
            if (error) {
                syslog.error('%s! getting all blog posts from db: %j', error, data);
                callback({message: 'Could not load all blog posts!'});
                return;
            }

            callback({data: results.getAll, count: results.getCount});
        });
    };

    /**
     * Gets a single blog post by id.
     *
     * @param {!object} data The data from client.
     * @param {!string} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.getPostById = function (data, callback) {
        data = data || {};

        repo.posts.getOneById(data.id, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting blog post from db: %s', error, data.id);
                callback({message: 'Could not load blog post!'});
                return;
            }

            if (result) {
                var post = result;

                if (post.comments && post.comments.length > 0) {
                    repo.comments.getAll({_id: {$in: post.comments}}, function (error, result) {
                        if (error) {
                            syslog.error('%s! getting blog post from db: %s', error, data.id);
                            callback({message: 'Could not load blog post!'});
                            return;
                        }

                        post.comments = result;

                        callback({data: post});
                    });
                } else {
                    callback({data: post});
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
                callback({message: 'Could not create blog post!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.created = new Date();

                // save in repo
                repo.posts.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating blog post in db: %j', error, data);
                        callback({message: 'Could not create blog post!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created blog post in db: %j', data);
                        callback({data: result[0]});

                        updateTagCount();
                    }
                });
            } else {
                callback({errors: result.errors});
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
        if (!data) {
            callback({});
            return;
        }

        // validate client data
        repo.posts.validate(data, {isUpdate: true}, function (error, result) {
            if (error) {
                syslog.error('%s! validating blog post: %j', error, data);
                callback({message: 'Could not update blog post!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.modified = new Date();

                // save in repo
                repo.posts.update({_id: data._id}, {$set: data}, function (error, result) {
                    if (error || result === 0) {
                        syslog.error('%s! updating blog post in db: %j', error, data);
                        callback({message: 'Could not update blog post!'});
                        return;
                    }

                    if (result) {
                        audit.info('Updated blog post in db: %j', data);
                        callback({success: result});

                        updateTagCount();
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Adds a comment to a blog post.
     *
     * @param {object} data The comment data.
     * @param {!function(result)} callback The callback.
     */
    pub.addComment = function (data, callback) {
        data = data || {};
        var postId = data.post_id;

        // validate client data
        repo.comments.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating comment: %j', error, data);
                callback({message: 'Could not create comment!'});
                return;
            }

            if (result.valid) {
                // set created date
                data.created = new Date();

                // save in repo
                repo.comments.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating comment in db: %j', error, data);
                        callback({message: 'Could not create comment!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created comments in db: %j', data);
                        callback({data: result[0]});

                        repo.posts.update({_id: postId}, {$push: {comments: result[0]._id}}, function (error) {
                            if (error) {
                                syslog.error('%s! creating comment in db: %j', error, data);
                                callback({message: 'Could not create comment!'});
                            }
                        });
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Gets all tags from db.
     *
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.getAllTags = function (data, callback) {
        repo.tags.getAll(data.params || {}, data.options || {}, function (error, result) {
            if (error) {
                syslog.error('%s! getting all blog posts from db: %j', error, data);
                callback({message: 'Could not load all blog posts!'});
                return;
            }

            callback({data: result});
        });
    };

    /**
     * Creates a new tag in the db.
     *
     * @param {object} data The tag data.
     * @param {!function(result)} callback The callback.
     */
    pub.createTag = function (data, callback) {
        // validate client data
        repo.tags.validate(data || {}, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating tag: %j', error, data);
                callback({message: 'Could not create tag!'});
                return;
            }

            if (result.valid) {
                // save in repo
                repo.tags.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating tag in db: %j', error, data);
                        callback({message: 'Could not create tag!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created blog tag db: %j', data);
                        callback({data: result[0]});
                    }
                });
            } else {
                callback({errors: result.errors});
            }
        });
    };

    /**
     * Deletes a tag.
     *
     * @param {object} data The data.
     * @param {string|object} data.id The id.
     * @param {!function(result)} callback The callback.
     */
    pub.deleteTag = function (data, callback) {
        data = data || {};

        repo.tags.delete({_id: data.id}, function (error, result) {
            if (error || result === 0) {
                syslog.error('%s! deleting tag in db: %j', error, data);
                callback({message: 'Could not delete tag!'});
                return;
            }

            if (result) {
                audit.info('Deleted tag in db: %j', data);
                callback({success: result});
            }
        });
    };

    return pub;
};