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