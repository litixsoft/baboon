/*global angular*/
angular.module('admin.services', [])
    .factory('authorPosts', function (socket) {
        var pub = {};

        pub.getById = function (id, callback) {
            socket.emit('blog:getPostById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (post, callback) {
            socket.emit('blog:createPost', post, function (result) {
                callback(result);
            });
        };

        pub.update = function (post, callback) {
            socket.emit('blog:updatePost', post, function (result) {
                callback(result);
            });
        };

        pub.addComment = function (id, comment, callback) {
            comment.post_id = id;
            socket.emit('blog:addComment', comment, function (result) {
                callback(result);
            });
        };

        return pub;
    })
    .factory('tags', function (socket) {
        var pub = {},
            tags = [],
            refresh = true;

        pub.getAll = function (query, callback) {
            if (refresh) {
                socket.emit('blog:getAllTags', query, function (result) {
                    if (result.data) {
                        tags = result.data;
                        refresh = false;
                    }

                    callback(result);
                });
            } else {
                callback({data: tags});
            }
        };

        pub.createTag = function (tag, callback) {
            socket.emit('blog:createTag', tag, function (result) {
                callback(result);
            });
        };

        pub.updateTag = function (tag, callback) {
            socket.emit('blog:updateTag', tag, function (result) {
                callback(result);
            });
        };

        pub.deleteTag = function (id, callback) {
            socket.emit('blog:deleteTag', {id: id}, function (result) {
                callback(result);
            });
        };

        return pub;
    });