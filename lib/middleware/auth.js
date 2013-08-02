'use strict';

var pwd = require('pwd');

module.exports = function () {
    var users = {
            admin: {
                id: 1,
                name: 'admin',
                acl: {
                    'example/blog/blog/getAllPosts': true,
                    'example/blog/blog/getAllPostsWithCount': true,
                    'example/blog/blog/searchPosts': true,
                    'example/blog/blog/getPostById': true,
                    'example/blog/blog/createPost': true,
                    'example/blog/blog/updatePost': true,
                    'example/blog/blog/addComment': true,
                    'example/blog/blog/getAllTags': true,
                    'example/blog/blog/createTag': true,
                    'example/blog/blog/deleteTag': true,
                    'example/enterprise/enterprise/getAll': true,
                    'example/enterprise/enterprise/getById': true,
                    'example/enterprise/enterprise/updateById': true,
                    'example/enterprise/enterprise/create': true
                }
            },
            timo: {
                id: 1,
                name: 'timo',
                acl: {
                    'example/enterprise/enterprise/getAll': true,
                    'example/enterprise/enterprise/getById': true,
                    'example/enterprise/enterprise/updateById': true,
                    'example/enterprise/enterprise/create': true
                }
            },
            andreas: {
                id: 1,
                name: 'andreas',
                acl: {
                    'example/blog/blog/getAllPosts': true,
                    'example/blog/blog/getAllPostsWithCount': true,
                    'example/blog/blog/searchPosts': true,
                    'example/blog/blog/getPostById': true,
                    'example/blog/blog/createPost': true,
                    'example/blog/blog/updatePost': true,
                    'example/blog/blog/addComment': true,
                    'example/blog/blog/getAllTags': true,
                    'example/blog/blog/createTag': true,
                    'example/blog/blog/deleteTag': true
                }
            }
        },
        pub = {};

    function authenticate (name, pass, callback) {
//        rights.getUserForLogin(name, function (error, user) {
//            if (!user) {
//                callback(new Error('cannot find user'));
//            } else {
//                rights.getUser(user._id, function (error, result) {
//                    callback(null, result);
//                });
//            }
//        });

        var user = users[name];

        // query the db for the given username
        if (!user) {
            callback(new Error('cannot find user'));
        } else {
//            // apply the same algorithm to the POSTed password, applying
//            // the hash against the pass / salt, if there is a match we
//            // found the user
//            pwd.hash(pass, user.salt, function (err, hash) {
//                if (hash && hash.toString() === user.hash.toString()) {
//                    callback(null, user);
//                } else {
//                    callback(new Error('invalid password'));
//                }
//            });

            callback(null, user);
        }
    }

    pwd.hash('a', function (err, salt, hash) {
        if (err) {
            throw err;
        }
        users.admin.salt = salt;
        users.admin.hash = hash;
    });

    pub.login = function (req, res) {
        authenticate(req.body.username, req.body.password, function (err, user) {
            if (user) {
                // Regenerate session when signing in
                // to prevent fixation
                req.session.regenerate(function () {
                    // Store the user's primary key
                    // in the session store to be retrieved,
                    // or in this case the entire user object
                    req.session.user = user;
                    req.session.success = 'Authentication as ' + user.name + ' successfully';
                    req.session.activity = new Date();
                    req.session.start = new Date();
                    res.redirect('back');
                });
            } else {
                req.session.error = 'Authentication failed, please check your' +
                    ' username and password.';
                res.redirect('login');
            }
        });
    };

    pub.logout = function (req, res) {
        // destroy the user's session to log them out
        // will be re-created next request
        req.session.destroy(function () {
            res.redirect('/login');
        });
    };

    pub.restricted = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id !== -1) {
            next();
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login');
        }
    };

    return pub;
};