/*global angular*/
angular.module('blog.services', [])
    .factory('posts', function (socket) {
        var pub = {};

        pub.getAll = function (query, callback) {
            socket.emit('blog:getAllPosts', query, function (result) {
                callback(result);
            });
        };

        pub.searchPosts = function (query, callback) {
            socket.emit('blog:searchPosts', query, function (result) {
                callback(result);
            });
        };

        pub.getAllWithCount = function (query, callback) {
            socket.emit('blog:getAllPostsWithCount', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit('blog:getPostById', {id: id}, function (result) {
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
    });