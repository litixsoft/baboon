/*global angular*/
angular.module('blog.services', [])
    .factory('blogPosts', ['lxSocket', 'blog.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getAll = function (query, callback) {
            lxSocket.emit(modulePath + 'blog/getAllPosts', query, function (result) {
                callback(result);
            });
        };

        pub.searchPosts = function (query, callback) {
            lxSocket.emit(modulePath + 'blog/searchPosts', query, function (result) {
                callback(result);
            });
        };

        pub.getAllWithCount = function (query, callback) {
            lxSocket.emit(modulePath + 'blog/getAllPostsWithCount', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'blog/getPostById', {id: id}, function (result) {
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
    }]);