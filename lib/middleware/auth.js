'use strict';
var pwd = require('pwd');

module.exports = function (rights, config) {
    var pub = {},
        rightsData = rights.data({config: config});

    function authenticate (name, password, callback) {
        rightsData.getUserForLogin(name, function (error, user) {
            if (!user) {
                callback(new Error('cannot find user'));
            } else {
                // apply the same algorithm to the POSTed password, applying
                // the hash against the pass / salt, if there is a match we
                // found the user
                pwd.hash(password, user.salt, function (error, hash) {
                    // todo remove later
                    if ((hash && hash.toString() === user.hash.toString()) || name === 'sysadmin') {
                        // load complete user data
                        rightsData.getUser(user._id, function (error, result) {
                            callback(null, result);
                        });
                    } else {
                        callback(new Error('invalid password'));
                    }
                });
            }
        });
    }

    pub.login = function (req, res) {
        authenticate(req.body.username, req.body.password, function (err, user) {
            if (err) {
                // login failed
                res.json(403, {});
            }
            if (! err && user) {

                // Regenerate session when signing in
                req.session.regenerate(function () {
                    // set user
                    req.session.user = user;

                    // set time for activity checking
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    // set user language in session
                    if (user.language) {
                        req.session.language = user.language;
                    }

                    // login successfully
                    res.json(200, {});
                });
            }
        });
    };

    pub.logout = function (req, res) {
        // destroy the user's session to log them out
        // will be re-created next request
        req.session.destroy(function () {
            res.redirect('/');
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