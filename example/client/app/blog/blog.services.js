/*global angular*/
angular.module('blog.services', ['app.services'])
    .factory('posts', function (socket) {
        var pub = {},
            posts = [
                {
                    _id: 1,
                    author: 'Wayne 1',
                    created: new Date(),
                    title: 'Post 1',
                    content: 'Content1',
                    hidden: true,
                    comments: [
                        {title: 'c1'},
                        {title: 'c2'},
                        {title: 'c3'}
                    ]
                },
                {
                    _id: 2,
                    author: 'Wayne 2',
                    created: new Date(),
                    title: 'Post 2',
                    content: 'Content2',
                    hidden: false
                },
                {
                    _id: 3,
                    author: 'Wayne 3',
                    created: new Date(),
                    title: 'Post 3',
                    content: 'Content3'
                },
                {
                    _id: 4,
                    author: 'Wayne 4',
                    created: new Date(),
                    title: 'Post 4',
                    content: 'Content4'
                }
            ];

        pub.getAll = function (callback) {
            return callback(posts);

//            if(typeof enterprise === 'undefined' || enterprise.length === 0 ) {
//                socket.emit('enterprise:getAll',{}, function(data) {
//                    enterprise = data;
//                    callback(data);
//                });
//            }
//            else {
//                callback(enterprise);
//            }
        };

        pub.getAllSocket = function (callback) {
            socket.emit('blog:getAllPosts', {}, function (data) {
                posts = data;
                callback(data);
            });
        };

        pub.getById = function (id, callback) {
            callback(posts[id]);
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
//
//        pub.updateById = function (id, person, callback) {
////            socket.emit('enterprise:updateById',{id: id, person: person}, function(data) {
////                enterprise[id] = person;
////                callback(data);
////            });
//        };

        pub.create = function (post, callback) {
            posts.push(post);

            callback(1);
//            socket.emit('enterprise:create',{person: person}, function(data) {
//                if (!Array.isArray(enterprise)) {
//                    enterprise = [];
//                }
//
//                enterprise.push(person);
//                callback(data);
//            });
        };

        return pub;
    });