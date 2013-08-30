/*global angular*/
angular.module('blog.services', [])
    .factory('posts', ['socket', 'blog.modulePath', function (socket, modulePath) {
        var pub = {};

        pub.getAll = function (query, callback) {
            socket.emit(modulePath + 'blog/getAllPosts', query, function (result) {
                callback(result);
            });
        };

        pub.searchPosts = function (query, callback) {
            socket.emit(modulePath + 'blog/searchPosts', query, function (result) {
                callback(result);
            });
        };

        pub.getAllWithCount = function (query, callback) {
            socket.emit(modulePath + 'blog/getAllPostsWithCount', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit(modulePath + 'blog/getPostById', {id: id}, function (result) {
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
    }]);