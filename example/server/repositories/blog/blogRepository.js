'use strict';

module.exports = function (lxDb, blogConnection) {
    if (arguments.length < 2) {
        throw new Error('missing parameters');
    }

    var db = lxDb.GetDb(blogConnection, ['posts', 'tags', 'comments']),
//        async = require('async'),
        postRepo = require('./postRepository')(db.posts, lxDb),
        tagRepo = require('./tagRepository')(db.tags, lxDb),
        commentRepo = require('./commentRepository')(db.comments, lxDb);

    // Helper

//    /**
//     * checkGetOneByIdParameters
//     * @param id
//     * @param options
//     * @param cb
//     */
//    function checkGetOneByIdParameters (id, options, cb) {
//        if (typeof id !== 'object' && typeof id !== 'string') {
//            throw new Error('id must be of string or object type');
//        }
//
//        if (typeof options !== 'object') {
//            throw new Error('options must be of object type');
//        }
//
//        if (typeof cb !== 'function') {
//            throw new Error('callback must be of function type');
//        }
//    }

//    /**
//     * getComments
//     * @param comments
//     * @param options
//     * @param cb
//     */
//    function getComments(comments, options, cb) {
//        var length, idArr = [], i, max;
//        length = comments.length;
//
//        if (options.limit === 0 || options.limit > length) {
//            options.limit = length;
//        }
//
//        for (i = options.skip, max = options.limit; i < max; i += 1) {
//            idArr.push(comments[i]._id);
//        }
//
//        commentRepo.getAll({_id: {$in: idArr}}, function (err, res) {
//            var users = [], i, max;
//            for (i = 0, max = res.length; i < max; i += 1) {
//                users.push(res[i].author);
//            }
//
//            userRepo.getAll({_id: {$in: users}},
//                {projection: {userName: 1, firstName: 1, lastName: 1}}, function (err, usr) {
//                    var i, y, max, max2;
//                    for (i = 0, max = usr.length; i < max; i += 1) {
//                        for (y = 0, max2 = res.length; y < max2; y += 1) {
//                            if (res[y].author.toString() === usr[i]._id.toString()) {
//                                res[y].author = usr[i];
//                            }
//                        }
//                    }
//
//                    comments = res;
//                    cb(null, comments);
//                });
//        });
//    }

    // Blog API

    /**
     * posts
     */
//    var posts = (function () {
//        /**
//         * getOneById with references
//         * @param id
//         * @param options
//         * @param cb
//         */
//    postRepo.getOneById_WR = function (id, options, cb) {
//
//        if (arguments.length < 2) {
//            throw new Error('missing parameters');
//        }
//
//        if (arguments.length === 2) {
//            cb = options;
//            options = {};
//        }
//
//        checkGetOneByIdParameters(id, options, cb);
//
//        var skip = 0, limit = 0;
//
//        if (options.hasOwnProperty('commentsSkip')) {
//            //noinspection JSUnresolvedVariable
//            skip = options.commentsSkip;
//            //noinspection JSUnresolvedVariable
//            delete options.commentsSkip;
//        }
//
//        if (options.hasOwnProperty('commentsLimit')) {
//            //noinspection JSUnresolvedVariable
//            limit = options.commentsLimit;
//            //noinspection JSUnresolvedVariable
//            delete options.commentsLimit;
//        }
//
//        postRepo.getOneById(id, options, function (err, post) {
//
//            //noinspection JSUnresolvedFunction
//            async.parallel(
//                {
//                    tags: function (callback) {
//                        var idArr = [], i, max;
//
//                        for (i = 0, max = post.tags.length; i < max; i += 1) {
//                            idArr.push(post.tags[i]._id);
//                        }
//                        tagRepo.getAll({_id: {$in: idArr}}, callback);
//                    },
//                    author: function (callback) {
//                        userRepo.getOneById(post.author, callback);
//                    },
//                    category: function (callback) {
//                        categoryRepo.getOneById(post.category, callback);
//                    },
//                    comments: function (callback) {
//                        getComments(post.comments, {skip: skip, limit: limit}, callback);
//                    }
//                },
//                function (err, res) {
//
//                    post.tags = res.tags;
//                    post.author = res.author;
//                    post.category = res.category;
//                    post.comments = res.comments;
//
//                    cb(null, post);
//                }
//            );
//        });
//    };

//    /**
//     * getPostComments
//     * @param id
//     * @param options
//     * @param cb
//     */
//    postRepo.getPostComments_WR = function (id, options, cb) {
//        if (arguments.length < 2) {
//            throw new Error('missing parameters');
//        }
//
//        if (arguments.length === 2) {
//            cb = options;
//            options = {};
//        }
//
//        checkGetOneByIdParameters(id, options, cb);
//
//        if (!options.hasOwnProperty('skip')) {
//            options.skip = 0;
//        }
//
//        if (!options.hasOwnProperty('limit')) {
//            options.limit = 0;
//        }
//
//        postRepo.getOneById(id, {projection: {comments: 1}}, function (err, res) {
//            getComments(res.comments, options, cb);
//        });
//    };

    postRepo.createComment = function (id, comment, cb) {
        if (arguments.length < 3) {
            throw new Error('missing parameters');
        }

        if (typeof id !== 'object' && typeof id !== 'string') {
            throw new Error('id must be of string or object type');
        }

        if (typeof comment !== 'object') {
            throw new Error('options must be of object type');
        }

        if (typeof cb !== 'function') {
            throw new Error('callback must be of function type');
        }

        if (typeof comment.author !== 'object' && typeof comment.author !== 'string') {
            throw new Error('comment.author must be of object or string Id type');
        }

        if (comment.author.hasOwnProperty('userName')) {
            comment.author = comment.author._id;
        }

        commentRepo.create(comment, function (err, res) {
            if (err) {
                cb(err);
            } else if (res) {
                postRepo.update({_id: id}, {$push: {comments: {_id: comment._id}}}, cb);
            } else {
                cb(null);
            }
        });

    };

    postRepo.deleteComment = function (postId, commentId, cb) {
        if (arguments.length < 3) {
            throw new Error('missing parameters');
        }

        if (typeof postId !== 'object' && typeof postId !== 'string') {
            throw new Error('postId must be of string or object type');
        }

        if (typeof commentId !== 'object' && typeof commentId !== 'string') {
            throw new Error('commentId must be of string or object type');
        }

        if (typeof cb !== 'function') {
            throw new Error('callback must be of function type');
        }

        commentId = postRepo.convertId(commentId);

        postRepo.update({_id: postId}, {$pull: {comments: {_id: commentId}}}, function (err) {
            if (err) {
                cb(err);
            } else {
                commentRepo.delete({_id: commentId}, cb);
            }
        });
    };
//
//        return postRepo;
//    })();

////    /**
////     * comments
////     */
////    var comments = (function () {
//    commentRepo.getOneById_WR = function (id, options, cb) {
//
//        if (arguments.length < 2) {
//            throw new Error('missing parameters');
//        }
//
//        if (arguments.length === 2) {
//            cb = options;
//            options = {};
//        }
//
//        checkGetOneByIdParameters(id, options, cb);
//
//        commentRepo.getOneById(id, options, function (err, comment) {
//            userRepo.getOneById(comment.author, function (err, author) {
//                comment.author = author;
//                cb(null, comment);
//            });
//        });
//    };
////
////        return commentRepo;
////    })();

    return {
        posts: postRepo,
        tags: tagRepo,
        comments: commentRepo
    };
};