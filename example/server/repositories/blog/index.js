'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (blogConnection) {
    var db = lxDb.GetDb(blogConnection, ['posts', 'tags', 'comments']),
        postRepo = require('./postRepository')(db.posts),
        tagRepo = require('./tagRepository')(db.tags),
        commentRepo = require('./commentRepository')(db.comments);

    return {
        posts: postRepo,
        tags: tagRepo,
        comments: commentRepo
    };
};