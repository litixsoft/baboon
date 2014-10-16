'use strict';

var lxHelpers = require('lx-helpers');

/**
 * Auth Object
 *
 * @param {!Object} baboon
 * @returns {Object}
 */
module.exports = function (baboon) {

    var pub = {};
    var config = baboon.config;
    var rights = baboon.rights;
    var syslog = baboon.loggers.syslog;
    var crypto = baboon.crypto;
    var AuthError = baboon.AuthError;

    /**
     * Authenticate
     * Helper for login
     *
     * @param username
     * @param password
     * @param callback
     */
    var authenticate = function (username, password, callback) {

        // get user from db
        rights.getUser(username, function (error, user) {
            if(!user.is_active) {
                callback(new AuthError('Login Failed, account is inactive', 403));
            }
            else if (!error && !lxHelpers.isEmpty(user)) {
                // check password
                crypto.compare(password, user.password, user.salt, function (error, result) {
                    if (!error && result) {
                        if (result.is_equal) {
                            // delete hash and salt from user
                            delete user.password;
                            delete user.salt;

                            callback(null, user);
                        }
                        else {
                            callback(new AuthError('Login Failed, password for ' + username + ' does not match', 403));
                        }
                    }
                    else {
                        callback(error || new AuthError('Login Failed, unknown error in compare password', 500));
                    }
                });
            }
            else {
                callback(new AuthError('Login failed, ' + username + ' not found', 403));
            }
        });
    };

    /**
     * Login
     * Login with username and password
     *
     * @param req
     * @param res
     * @param next
     */
    pub.login = function (req, res, next) {

        // params
        var user = req.body.user;

        if (typeof user !== 'object') {
            return next(new AuthError('Parameter user is required and must be a object type!', 400));
        }

        if (typeof user.username !== 'string') {
            return next(new AuthError('Parameter username is required and must be a string type!', 400));
        }

        if (typeof user.password !== 'string') {
            return next(new AuthError('Parameter password is required and must be a string type!', 400));
        }

        // check guest system user
        if (user.username.toLowerCase() === 'guest') {
            return next(new AuthError('Guest is a reserved system name and can not be used for the login.', 400));
        }

        authenticate(user.username, user.password, function (error, user) {

            if (!error && user) {

                // login successfully, setup session
                req.session.regenerate(function () {

                    // new session
                    req.session.activity = new Date();
                    req.session.start = new Date();
                    req.session.data = {};
                    req.session.loggedIn = true;
                    req.session.user = user;

                    syslog.debug('session regenerate after login with user: ' + user.name);
                    return res.json(200, 'login successfully');
                });
            }
            else {
                syslog.warn(error.name + ': ' + error.message);
                return next(new AuthError('Username or password do not match', 403), res);
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
     * restricted
     *
     * @param {!Object} req
     * @param {!Object} res
     * @param {!Function} next
     */
    pub.restricted = function (req, res, next) {

        // check session and user when rights is enabled and masterLoginPage is true
        if (config.rights.enabled && config.rights.masterLoginPage) {

            // not in Guest role
            if (req.session.user && !rights.userIsInRole(req.session.user, 'Guest')) {
                next();
            }
            else {
                res.redirect('/account/login');
            }
        }
        else {
            next();
        }
    };

    /**
     * restrictedUser
     *
     * @param {!Object} req
     * @param {!Object} res
     * @param {!Function} next
     */
    pub.restrictedUser = function (req, res, next) {

        // check session and user when rights is enabled and  masterLoginPage is true
        if (config.rights.enabled && config.rights.masterLoginPage) {

            // in User or Admin role
            if (req.session.user && rights.userIsInRole(req.session.user, 'User') ||
                rights.userIsInRole(req.session.user, 'Admin') || req.session.user.name === 'sysadmin') {
                next();
            }
            else {
                res.redirect('/account/login');
            }
        }
        else {
            next();
        }
    };

    /**
     * restrictedAdmin
     *
     * @param {!Object} req
     * @param {!Object} res
     * @param {!Function} next
     */
    pub.restrictedAdmin = function (req, res, next) {

        // check session and user when rights is enabled and masterLoginPage is true
        if (config.rights.enabled && config.rights.masterLoginPage) {

            if (req.session.user && rights.userIsInRole(req.session.user, 'Admin')) {
                next();
            }
            else {
                res.redirect('/account/login');
            }
        }
        else {
            next();
        }
    };

    return pub;
};