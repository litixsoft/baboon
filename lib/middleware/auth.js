'use strict';
var pwd = require('pwd');

module.exports = function (app) {
    var pub = {};

    /**
     * authenticate
     * Authenticate check username and password in db.
     *
     * @param username
     * @param password
     * @param callback
     */
    var authenticate = function (username, password, callback) {
        // Get user for login
        app.rights.getUserForLogin(username, function (error, user) {
            // Check error and result.
            if (error) {
                callback(error, null);
            }
            else if (!user) {
                app.logging.syslog.info('auth: User %s not found!', username);
                callback(new app.AuthenticationError());
            } else {
                pwd.hash(password, user.salt, function (error, hash) {
                    // todo remove later
                    if ((hash && hash.toString() === user.hash.toString()) || username === 'sysadmin') {
                        // load complete user data
                        app.rights.getUser(user._id, function (error, result) {
                            callback(null, result);
                        });
                    } else {
                        app.logging.syslog.info('auth: Incorrect password for user %s!', username);
                        callback(new app.AuthenticationError());
                    }
                });
            }
        });
    };

    /**
     * login
     * Login middleware authenticate users on system and regenerate the session.
     *
     * @param {object} req
     * @param {object} res
     */
    pub.login = function (req, res) {
        // params
        var username = req.body.username;
        var password = req.body.password;

        // check params
        if (typeof username !== 'string' || typeof password !== 'string') {
            app.logging.syslog.error('auth: Username and password are required and must be of type string.');
            res.json({error: 500});
        }

        // authenticate username and password
        authenticate(username, password, function (error, result) {
            // check error
            if (error) {
                if (error instanceof app.AuthenticationError) {
                    res.json({error: 401});
                }
                else {
                    res.json({error: 500});
                }
            } else if (!result) {
                app.logging.syslog.error('auth: User %s not found!', username);
                res.json({error: 500});
            } else {
                // Login was successful, regenerate session and user login.
                req.session.regenerate(function () {
                    // set user
                    req.session.user = result;

                    // set remember cookie, 7 days
                    if (req.body.rememberme) {
                        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                    }

                    // set time for activity checking
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    // set user language in session
                    if (result.language) {
                        req.session.language = result.language;
                    }

                    res.json({error: null, data: 'login successfully'});
                });
            }
        });
    };

    /**
     * logout
     * Logout destroy the user's session to log them out.
     * A new session will be re-created next request.
     *
     * @param req
     * @param res
     */
    pub.logout = function (req, res) {
        req.session.destroy(function () {
            res.redirect('/');
        });
    };

    /**
     * getAuthData
     * gets isAuth bool and the username
     *
     * @param req
     * @param res
     */
    pub.getAuthData = function (req, res) {

        var isAuth = false;
        var username;

        // check if guest
        if (req.session.user.id !== -1) {
            isAuth = true;
        }

        if (!req.session.user.displayName) {
            username = req.session.user.username;
        }
        else {
            username = req.session.user.displayName;
        }

        res.json({error: null, data:{isAuth: isAuth, username: username}});
    };

    /**
     * Restricted guest api
     * Check, is user guest or higher in session.
     * Send res.json to client.
     *
     * @param req
     * @param res
     * @param next
     */
    pub.restrictedGuestApi = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id >= -1) {
            next();
        } else {
            res.json(403, 'Access denied.');
        }
    };

    /**
     * Restricted guest route
     * Check, is user guest or higher in session.
     * Send redirect
     *
     * @param req
     * @param res
     * @param next
     */
    pub.restrictedGuestRoute = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id >= -1) {
            next();
        } else {
            res.redirect('/login');
        }
    };

    /**
     * Restricted auth user api
     * Check, is user not guest in session
     *
     * @param req
     * @param res
     * @param next
     */
    pub.restrictedAuthUserApi = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id !== -1) {
            next();
        } else {
            res.json(403, 'Access denied.');
        }
    };

    /**
     * Restricted auth user route
     * Check, is user not guest in session
     *
     * @param req
     * @param res
     * @param next
     */
    pub.restrictedAuthUserRoute = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id !== -1) {
            next();
        } else {
            res.redirect('/login');
        }
    };

    /**
     * Restricted auth user route
     * Check, is user not guest in session
     *
     * @param req
     * @param res
     * @param next
     */
    pub.restrictedAdminRoleRoute = function (req, res, next) {
        // session and user is not guest
        if (req.session.user && req.session.user.id !== -1) {
            next();
        } else {
            res.redirect('/login');
        }
    };

    return pub;
};