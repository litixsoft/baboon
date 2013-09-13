/*global angular*/
angular.module('admin.services', [])
    .factory('authorPosts', ['lxSocket', 'blog.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'blog/getPostById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (post, callback) {
            lxSocket.emit(modulePath + 'blog/createPost', post, function (result) {
                callback(result);
            });
        };

        pub.update = function (post, callback) {
            lxSocket.emit(modulePath + 'blog/updatePost', post, function (result) {
                callback(result);
            });
        };

        pub.addComment = function (id, comment, callback) {
            comment.post_id = id;
            lxSocket.emit(modulePath + 'blog/addComment', comment, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('tags', ['lxSocket', 'blog.modulePath', function (lxSocket, modulePath) {
        var pub = {},
            tags = [];

        pub.refresh = true;

        pub.getAll = function (query, callback) {
            if (pub.refresh) {
                lxSocket.emit(modulePath + 'blog/getAllTags', query, function (result) {
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
            lxSocket.emit(modulePath + 'blog/createTag', tag, function (result) {
                callback(result);
            });
        };

        pub.updateTag = function (tag, callback) {
            lxSocket.emit(modulePath + 'blog/updateTag', tag, function (result) {
                callback(result);
            });
        };

        pub.deleteTag = function (id, callback) {
            lxSocket.emit(modulePath + 'blog/deleteTag', {id: id}, function (result) {
                callback(result);
            });
        };

        return pub;
    }]);