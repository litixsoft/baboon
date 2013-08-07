/*global angular*/
angular.module('blog.services', [])
    .factory('posts', function (socket) {
        var pub = {};

        pub.getAll = function (query, callback) {
            socket.emit('example/blog/blog/getAllPosts', query, function (result) {
                callback(result);
            });
        };

        pub.searchPosts = function (query, callback) {
            socket.emit('example/blog/blog/searchPosts', query, function (result) {
                callback(result);
            });
        };

        pub.getAllWithCount = function (query, callback) {
            socket.emit('example/blog/blog/getAllPostsWithCount', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit('example/blog/blog/getPostById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.addComment = function (id, comment, callback) {
            comment.post_id = id;
            socket.emit('example/blog/blog/addComment', comment, function (result) {
                callback(result);
            });
        };

        return pub;
    });