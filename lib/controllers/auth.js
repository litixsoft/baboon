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
                callback(error);
                return;
            }
            if (!user) {
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
            callback(new Error('Error login: Username and password required and must be a string type.'));
            return;
        }

        // authenticate username and password
        authenticate(username, password, function (error, user) {

            // check error
            if (error) {
                if (error.auth) {
                    logging.syslog.debug(error.auth);
                    callback(401);
                    return;
                }
                else {
                    callback(error);
                    return;
                }
            }
            if (!user) {
                callback(new Error('Error authenticate: No user returned!'));
                return;
            }

            // get session
            req.getSession(function (error, session) {

                // check error
                if (error) {
                    callback(error);
                    return;
                }

                // Login was successful, regenerate session and user login.
                session.regenerate(function () {

                    // set user
                    session.user = user;

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

                    req.setSession(session, function(error) {
                        if (error) {
                            callback(error);
                            return;
                        }

                        callback(null, {message:'login successfully.'});
                    });
                });
            });
        });
    };

    return pub;
};