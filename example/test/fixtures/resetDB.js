'use strict';

var path = require('path'),
    async = require('async'),
    rootPath = path.resolve('..', '..', 'baboon/example'),
    baboon = require('../../../lib/baboon')(rootPath),
    blogRepo = require('../../server/modules/example/blog/repositories')(baboon.config.mongo.blog);

console.log('Resetting db: ' + baboon.config.mongo.blog);

async.parallel([
    function (callback) {
        blogRepo.posts.delete({}, callback);
    },
    function (callback) {
        blogRepo.tags.delete({}, callback);
    },
    function (callback) {
        blogRepo.comments.delete({}, callback);
    }
], function (err, results) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    console.log(results);
    process.exit(0);
});