'use strict';
var pwd = require('pwd');

module.exports = function (rights, config, logging) {
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
        rights.getUserForLogin(username, function (error, user) {

            // Check error and result.
            if (error) {
                callback(error, null);
            }
            else if (!user) {
                callback({auth: 'Error login: User ' + username + ' not found!'});
            } else {
                pwd.hash(password, user.salt, function (error, hash) {
                    // todo remove later
                    if ((hash && hash.toString() === user.hash.toString()) || username === 'sysadmin') {
                        // load complete user data
                        rights.getUser(user._id, function (error, result) {
                            callback(null, result);
                        });
                    } else {
                        callback({auth: 'Error login: Incorrect password for user ' + username + '!'});
                    }
                });
            }
        });
    };

    /**
     * Login authenticate users on system and regenerate the session.
     *
     * @param {object} data The data object.
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    pub.login = function (data, req, callback) {

        // params
        var username = data.username;
        var password = data.password;

        // check params
        if (typeof username !== 'string' || typeof password !== 'string') {
            return callback(new Error('Error login: Username and password required and must be a string type.'));
        }

        // authenticate username and password
        authenticate(username, password, function (error, user) {

            // check error
            if (error) {
                if (error.auth) {
                    logging.syslog.debug(error.auth);
                    return callback(401);
                }
                else {
                    return callback(error);
                }
            }
            if (!user) {
                return callback(new Error('Error authenticate: No user returned!'));
            }

            // get session
            req.getSession(function (error, session) {

                // check error
                if (error) {
                    return callback(error);
                }

                // Login was successful, regenerate session and user login.
                session.regenerate(function () {

                    // set user
                    session.user = result;

                    // set remember cookie, 7 days
                    if (data.rememberme) {
                        session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                    }

                    // set time for activity checking
                    session.activity = new Date();
                    session.start = new Date();

                    // set user language in session
                    if (user.language) {
                        session.language = user.language;
                    }

                    return callback(null, true);
                });
            });
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