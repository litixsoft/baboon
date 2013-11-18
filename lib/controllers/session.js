'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (rights, config, logging) {
    var pub = {};

    /**
     * Add a guest user to session.
     *
     * @param {!Object} session The session object.
     * @param {function} callback The callback.
     */
    var addGuestUserToSession = function (session, callback) {
        session.activity = new Date();
        session.start = new Date();
        logging.info('Info addGuestUserToSession: start new guest session');

        if (config.useRightsSystem) {
            rights.getUser(-1, function (error, user) {
                if (error) {
                    callback(error);
                    return;
                }

                if (lxHelpers.isEmpty(user)) {
                    callback(new Error('Error addGuestUserToSession: Guest not found in db!'));
                    return;
                }

                session.user = user;
                callback(null);
            });
        } else {
            session.user = {id: -1, username: 'guest'};
            callback(null);
        }
    };

    /**
     * Checks if a user exists and if the session is expired or inactive.
     *
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    var checkSession = function (req, callback) {

        req.getSession(function (error, session) {

            // check if session exists
            if (typeof session.user === 'undefined') {

                // session not exists, start new guest session
                addGuestUserToSession(session, callback);
            }
            else {

                // check session activity time
                var activity = new Date(session.activity),
                    start = new Date(session.start),
                    end = new Date(),
                    inactiveDifference = (end - activity) / 1000,
                    maxDifference = (end - start) / 1000;

                // check activity time
                if (config.sessionInactiveTime < inactiveDifference || config.sessionMaxLife < maxDifference) {

                    // to long inactive, regenerate session
                    session.regenerate(function () {
                        addGuestUserToSession(session, function (error) {
                            if (error) {
                                callback(error);
                                return;
                            }

                            callback(401);
                        });
                    });
                }
                else {

                    // session ok, renewal activity time
                    session.activity = new Date();
                    callback(null);
                }
            }
        });
    };

    /**
     * Set new activity time to session.
     *
     * @param {object} data The data object.
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    pub.setActivity = function (data, req, callback) {
        checkSession(req, callback);
    };

    /**
     * Get the last activity time from session.
     *
     * @param {!Object} req The request object.
     * @param {object} data The data object.
     * @param {function} callback The callback.
     */
    pub.getLastActivity = function (data, req, callback) {

        // get session
        req.getSession(function (error, session) {

            // check error
            if (error) {
                return callback(error);
            }

            // check own key
            if (!session.hasOwnProperty('activity')) {
                return callback('activity not found in session');
            }

            return callback(null, {activity: session.activity});
        });
    };

    /**
     * Get data from session data container.
     * Data container is a sandbox for the client to store data in the session.
     *
     * @param {!Object} req The request object.
     * @param {object} data The data object.
     * @param {function} callback The callback.
     */
    pub.getData = function (data, req, callback) {

        // get session
        req.getSession(function (error, session) {

            // check error
            if (error) {
                return callback(error);
            }

            // check own key
            if (!session.hasOwnProperty('data')) {
                session.data = {};
            }

            // return object
            var obj = {};
            var key = data.key;

            if (typeof key === 'undefined') {
                obj = session.data;
            }
            else {
                if (!session.data.hasOwnProperty(key)) {
                    return callback(new Error(key + ' not found in session'));
                }

                obj[key] = session.data[key];
            }

            return callback(null, obj);
        });
    };

    /**
     * Set data to session data container.
     * Data container is a sandbox for the client to store data in the session.
     *
     * @param {object} data The data object.
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    pub.setData = function (data, req, callback) {

        // get session
        req.getSession(function (error, session) {

            // check error
            if (error) {
                return callback(error);
            }

            // check own key
            if (!session.hasOwnProperty('data')) {
                session.data = {};
            }

            var key = data.key;
            var value = data.value;

            if (typeof key === 'undefined') {
                return callback(new Error('session setData error: key is undefined'));
            }

            if (typeof value === 'undefined') {
                return callback(new Error('session setData error: value is undefined'));
            }

            session.data[key] = value;

            return callback(null, {message: key + 'is saved in session'});
        });
    };

    /**
     * Delete data from session data container.
     * Data container is a sandbox for the client to store data in the session.
     *
     * @param {object} data The data object.
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    pub.deleteData = function (data, req, callback) {

        // get session
        req.getSession(function (error, session) {

            // check error
            if (error) {
                return callback(error);
            }

            // check data container
            if (!session.hasOwnProperty('data')) {
                session.data = {};
                return callback(null, {message: 'container session.data deleted'});
            }

            var key = data.key;

            if (typeof key === 'undefined') {
                session.data = {};
                return callback(null, {message: 'container session.data deleted'});
            }
            else {
                if (!session.data.hasOwnProperty(key)) {
                    return callback(new Error(key + ' not found in session'));
                }
                else {
                    delete session.data[key];
                    return callback(null, {message: key + ' is deleted in session'});
                }
            }
        });
    };

    /**
     * Delete data from session data container.
     * Data container is a sandbox for the client to store data in the session.
     *
     * @param {object} data The data object.
     * @param {!Object} req The request object.
     * @param {function} callback The callback.
     */
    pub.getAuthData = function (data, req, callback) {

        // get session
        req.getSession(function (error, session) {

            var isAuth = false;
            var username = '';

            // check error
            if (error) {
                return callback(error);
            }

            // check if guest
            if (session.user.id !== -1) {
                isAuth = true;
            }

            // check displayName
            if (!session.user.displayName) {
                username = session.user.username;
            }
            else {
                username = session.user.displayName;
            }

            return callback(null, {isAuth: isAuth, username: username});

        });
    };

    return pub;
};

