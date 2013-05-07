'use strict';

module.exports = function (socket, acl, config) {
    var res = {},
        lxDb = require('lx-mongodb'),
        repo = require(config.path.repositories).blog(lxDb, config.mongo.blog),
        base = require('../base');

    res.getAllPosts = function (data, callback) {
        repo.posts.getAll(data, function (err, res) {
            callback(res);
        });
    };

    res.getPostById = function (data, callback) {
        repo.posts.getById(data, function (err, res) {
            callback(res);
        });
    };

    // register resources
    base.register('blog', socket, acl, res);
};