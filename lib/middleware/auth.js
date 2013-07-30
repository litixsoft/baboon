'use strict';
var pwd = require('pwd');

module.exports = function (sessionInactiveTime, sessionMaxLife) {
    var users = {admin: {id: 1, name: 'admin'}},
        pub = {};

    function authenticate (name, pass, callback) {
        var user = users[name];
        // query the db for the given username
        if (!user) {
            callback(new Error('cannot find user'));
        } else {
            // apply the same algorithm to the POSTed password, applying
            // the hash against the pass / salt, if there is a match we
            // found the user
            pwd.hash(pass, user.salt, function (err, hash) {
                if (user.hash.toString() === hash.toString()) {
                    callback(null, user);
                } else {
                    callback(new Error('invalid password'));
                }
            });
        }
    }

    pwd.hash('a', function (err, salt, hash) {
        if (err) {
            throw err;
        }
        users.admin.salt = salt;
        users.admin.hash = hash;
    });

    pub.checkSession = function (req, res, callback) {
        // guest
        var user = {id: -1, name: 'guest'};

        // check if session exists
        if (typeof req.session.user === 'undefined') {
            // session not exists start new guest session
            req.session.user = user;
            req.session.activity = new Date();
            req.session.start = new Date();
            req.session.isExpired = isExpired;

            callback();
        } else {
            // check session activity time
            var activity = new Date(req.session.activity);
            var start = new Date(req.session.start);
            var end = new Date();
            var difference = (end - activity) / 1000;
            var maxDifference = (end - start) / 1000;

            // check activity time
            if (sessionInactiveTime < difference || sessionMaxLife < maxDifference) {
                // to long inactive, regenerate session
                req.session.regenerate(function () {
                    req.session.user = user;
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    callback();
                });
            }
            else {
                // session ok renewal activity time
                req.session.activity = new Date();

                callback();
            }
        }
    };

    pub.login = function (req, res) {
        //noinspection JSUnresolvedFunction
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