/*global angular*/
angular.module('admin.services', ['app.services'])
    .factory('authorPosts', function (socket) {
        var pub = {};

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

        pub.create = function (post, callback) {
//            posts.push(post);

//            callback(1);
            socket.emit('blog:createPost', post, function (result) {
//                if (!Array.isArray(enterprise)) {
//                    enterprise = [];
//                }
//
//                enterprise.push(person);
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
                callback({success: true, data: tags});
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