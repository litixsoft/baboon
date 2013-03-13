module.exports = function (config) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var users = {admin: {id: 1, name: 'admin', psw: 'a', salt: '', hash: ''}},
        pwd = require('pwd'),
        appName = config.appName,
        sessionActivityTime = config.sessionActivityTime,
        pub = {};

    pwd.hash('a', function (err, salt, hash) {
        users.admin.salt = salt;
        users.admin.hash = hash;
    });

    function authenticate(name, pass, cb) {
        var user = users[name];
        // query the db for the given username
        if (!user) {
            cb(new Error('cannot find user'));
        }
        else {
            // apply the same algorithm to the POSTed password, applying
            // the hash against the pass / salt, if there is a match we
            // found the user
            pwd.hash(pass, users[name].salt, function (err, hash) {
                if (users[name].hash === hash) {
                    cb(null, user);
                } else {
                    cb(new Error('invalid password'));
                }
            });
        }
    }

    pub.sessionExists = function (req, res, next) {
        if (typeof req.session.user !== 'undefined' && typeof req.session.activity !== 'undefined') {
            // renewal activity time
            req.session.activity = new Date();

    } else {
        // session first start
        req.session.user = {id: -1, name: 'guest'};
        req.session.activity = new Date();
    }

    next();
    };

    pub.siteContext = function (req, res, next) {
        var err = req.session.error,
            msg = req.session.success;

        delete req.session.error;
        delete req.session.success;

        if (err) {
            res.locals.sessionMsgClass = 'error';
            res.locals.sessionMsg = err;
        }
        if (msg) {
            res.locals.sessionMsgClass = 'success';
            res.locals.sessionMsg = msg;
        }
        res.locals.username = req.session.user.name;
        res.locals.activity = req.session.activity;
        res.locals.sid = req.sessionID;
        res.locals.appName = appName;

        next();
    };

    pub.sessionActivity = function (req, res, next) {
        // is an active session
        if (req.session.user && req.session.activity) {
            // check inactive time
            var start = new Date(req.session.activity);
            var end = new Date();
            var difference = (end - start) / 1000;
            //noinspection JSUnresolvedVariable
            if (sessionActivityTime < difference) {
                // to long inactive, regenerate session
                req.session.destroy();
                res.redirect('/login');
            } else {
                // session ok
                next();
            }
        } else {
            // no session exists
            next();
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
                    req.session.success = 'Authenticated successfully';
                    req.session.activity = new Date();
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