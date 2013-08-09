/*global angular*/
angular.module('admin.services', [])
    .factory('authorPosts', ['socket', 'blog.modulePath', function (socket, modulePath) {
        var pub = {};

        pub.getById = function (id, callback) {
            socket.emit(modulePath + 'blog/getPostById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (post, callback) {
            socket.emit(modulePath + 'blog/createPost', post, function (result) {
                callback(result);
            });
        };

        pub.update = function (post, callback) {
            socket.emit(modulePath + 'blog/updatePost', post, function (result) {
                callback(result);
            });
        };

        pub.addComment = function (id, comment, callback) {
            comment.post_id = id;
            socket.emit(modulePath + 'blog/addComment', comment, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('tags', ['socket', 'blog.modulePath', function (socket, modulePath) {
        var pub = {},
            tags = [];

        pub.refresh = true;

        pub.getAll = function (query, callback) {
            if (pub.refresh) {
                socket.emit(modulePath + 'blog/getAllTags', query, function (result) {
                    if (result.data) {
                        tags = result.data;
                        pub.refresh = false;
                    }

                    callback(result);
                });
            } else {
                callback({data: tags});
            }
        };

        pub.createTag = function (tag, callback) {
            socket.emit(modulePath + 'blog/createTag', tag, function (result) {
                callback(result);
            });
        };

        pub.updateTag = function (tag, callback) {
            socket.emit(modulePath + 'blog/updateTag', tag, function (result) {
                callback(result);
            });
        };

        pub.deleteTag = function (id, callback) {
            socket.emit(modulePath + 'blog/deleteTag', {id: id}, function (result) {
                callback(result);
            });
        };

        return pub;
    }]);