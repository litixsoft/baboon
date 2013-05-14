/*global angular*/
angular.module('blog.services', ['app.services'])
    .factory('posts', function (socket) {
        var pub = {},
            posts = [];

        pub.getAll = function (query, callback) {
            socket.emit('blog:getAllPosts', query, function (result) {
                posts = result;
                callback(result);
            });
        };

        pub.getAllWithCount = function (query, callback) {
            socket.emit('blog:getAllPostsWithCount', query, function (result) {
                posts = result;
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
//            callback(posts[id]);

            socket.emit('blog:getPostById', id, function (result) {
//                    enterprise = data;
                callback(result);
            });

//            if(typeof enterprise === 'undefined' || enterprise.length === 0 ) {
//                socket.emit('enterprise:getAll',{}, function(data) {
//                    enterprise = data;
//                    callback(enterprise[id]);
//                });
//            }
//            else {
//                callback(enterprise[id]);
//            }
        };

//        pub.create = function (post, callback) {
////            posts.push(post);
//
////            callback(1);
//            socket.emit('blog:createPost', post, function (result) {
////                if (!Array.isArray(enterprise)) {
////                    enterprise = [];
////                }
////
////                enterprise.push(person);
//                callback(result);
//            });
//        };
//
//        pub.update = function (post, callback) {
//            socket.emit('blog:updatePost', post, function (result) {
//                callback(result);
//            });
//        };

        pub.addComment = function(id, comment, callback) {
            comment.post_id = id;
            socket.emit('blog:addComment', comment, function (result) {
                callback(result);
            });
        };

        return pub;
    });