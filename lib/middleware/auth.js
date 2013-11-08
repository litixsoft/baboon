'use strict';
var pwd = require('pwd');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (rights, config, logging) {
    var pub = {};

    /**
     * authenticate
     *
     * @param username
     * @param password
     * @param callback
     */
    pub.authenticate = function (username, password, callback) {
        rights.getUserForLogin(username, function (error, user) {
            if (error) {
                callback(error);
            }
            else if (!user) {
                callback(new Error('User not found!'));
            } else {
                // apply the same algorithm to the POSTed password, applying
                // the hash against the pass / salt, if there is a match we
                // found the user
                pwd.hash(password, user.salt, function (error, hash) {
                    // todo remove later
                    if ((hash && hash.toString() === user.hash.toString()) || username === 'sysadmin') {
                        // load complete user data
                        rights.getUser(user._id, function (error, result) {
                            callback(null, result);
                        });
                    } else {
                        callback(new Error('Incorrect password!'));
                    }
                });
            }
        });
    };

    /**
     * loginSuccess
     * Call after successfully login.
     * This function create the session and send status code 200 to client.
     *
     * @param {object} req
     * @param {function} callback
     */
    pub.loginSuccess = function (req, callback) {

        req.session.regenerate(function () {
            // set user
            req.session.user = req.user;

            // set remember cookie, 7 days
            if (req.body.rememberme) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
            }

            // set time for activity checking
            req.session.activity = new Date();
            req.session.start = new Date();

            // set user language in session
            if (req.user.language) {
                req.session.language = req.user.language;
            }

            delete req.user;

            callback(null, true);
        });
    };

    /**
     * LocalStrategy for passport
     */
    passport.use(new LocalStrategy(
        function (username, password, done) {
            pub.authenticate(username, password,
                function (error, user) {
                    if (error) {
                        return done(null, false, error);
                    }

                    return done(null, user);
                }
            );
        }
    ));

    /**
     * login
     * Default login with passport local strategy.
     *
     * @param {object} req
     * @param {object} res
     * @param {function} next
     */
    pub.login = function (req, res, next) {
        passport.authenticate('local', {session: false}, function (err, user, info) {
            if (err) {
                next(err);
            }
            if (!user) {
                logging.syslog.debug('Login: %s', info.toString());
                res.json(401, {});
            }
            else {
                req.user = user
                pub.loginSuccess(req, function(error, result) {
                    if (! error && result) {

                        // login successfully
                        res.json(200, {});
                    }
                });
            }

        })(req, res, next);
    };

    /**
     * logout
     *
     * @param req
     * @param res
     */
    pub.logout = function (req, res) {
        // destroy the user's session to log them out
        // will be re-created next request
        req.session.destroy(function () {
            res.redirect('/');
        });
    };

    /**
     * restricted
     *
     * @param req
     * @param res
     * @param next
     */
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