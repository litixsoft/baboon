'use strict';
var lxDb = require('lx-mongodb');

module.exports = function (blogConnection) {
    var db = lxDb.GetDb(blogConnection, ['posts', 'tags', 'comments']),
//        async = require('async'),
        postRepo = require('./postRepository')(db.posts),
        tagRepo = require('./tagRepository')(db.tags),
        commentRepo = require('./commentRepository')(db.comments);

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

        commentRepo.insert(comment, function (err, res) {
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
                commentRepo.remove({_id: commentId}, cb);
            }
        });
    };

    return {
        posts: postRepo,
        tags: tagRepo,
        comments: commentRepo
    };
};