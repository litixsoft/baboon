'use strict';

var test = require('../../../../../lib/application')();

console.dir(test);

module.exports = function (socket, acl, config) {
    var pub = {},
        repo = require(config.path.repositories).blog(config.mongo.blog),
        base = require('../base');

    pub.getAllPosts = function (data, callback) {
        repo.posts.getAll(data, function (err, res) {
            callback(res);
        });
    };

    pub.getPostById = function (data, callback) {
        repo.posts.getById(data, function (err, res) {
            callback(res);
        });
    };

    pub.createPost = function(data, callback) {
        data = data || {};

        repo.posts.validate(data, {}, function(err, res) {
            console.dir(err);
            console.dir(res);
            data.created = new Date();
            console.dir(data);
        });
    };

    // register resources
    base.register(acl.name, socket, acl, pub);
};