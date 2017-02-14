'use strict';
var SessionError = require('./errors').SessionError;
var sessionstore = require('sessionstore');
var cookies = require('cookie');
var parseSignedCookie = require('cookie-parser').signedCookies;

/**
 * Library for session management in baboon.
 * Returns an object for session management, with the following methods.
 *
 * @param {Object} baboon object of baboon
 * @return {Object}
 */
module.exports = function (baboon) {

    // check parameters
    if (typeof baboon !== 'object') {
        throw new SessionError('Parameter baboon is required and must be a object type!');
    }

    var config = baboon.config;
    var syslog = baboon.loggers.syslog;
    var rightsEnabled = config.rights.enabled;

    var pub = {};
    var activeStore = config.session.stores[config.session.activeStore];
    var key = config.session.key;
    var secret = config.session.secret;

    // create session store
    var sessionStore = sessionstore.createSessionStore(activeStore);

    /**
     * Get created session store
     *
     * @return {Object}
     */
    pub.getSessionStore = function () {
        return sessionStore;
    };

    /**
     * Get sessionId from signed cookie
     *
     * @param {String} cookie a signed cookie
     * @return {String}
     */
    pub.getSessionId = function (cookie) {

        if (typeof cookie !== 'string') {
            throw new SessionError('Parameter cookie is required and must be a string type!');
        }

        var signedCookie = cookies.parse(cookie);
        return parseSignedCookie(signedCookie, secret)[key];
    };

    /**
     * Get session from session store with signed cookie
     *
     * @param {String} cookie a signed cookie
     * @param {Function} callback a callback function with error and session
     */
    pub.getSession = function (cookie, callback) {

        if (typeof cookie !== 'string') {
            throw new SessionError('Parameter cookie is required and must be a string type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        var sid = pub.getSessionId(cookie);

        sessionStore.get(sid, function (error, session) {
            if (error || !session) {
                callback(error || new SessionError('session ' + sid + ': not found', 400));
            }
            else {
                callback(null, session);
            }
        });
    };

    /**
     * Get session from session store with session id
     *
     * @param {String} sid a session id
     * @param {Function} callback a callback function with error and session
     */
    pub.getSessionById = function (sid, callback) {

        if (typeof sid !== 'string') {
            throw new SessionError('Parameter sid is required and must be a string type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        sessionStore.get(sid, function (error, session) {
            if (error || !session) {
                callback(error || new SessionError('session ' + sid + ': not found', 400));
            }
            else {
                callback(null, session);
            }
        });
    };

    /**
     * Save session data in store
     *
     * @param {Object} session a session to store
     * @param {Function} callback a callback function with error and bool
     */
    pub.setSession = function (session, callback) {

        if (typeof session !== 'object') {
            throw new SessionError('Parameter session is required and must be a object type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        sessionStore.set(session.id, session, function (error) {

            if (error) {
                callback(new SessionError(error, 400));
            }
            else {
                callback(null, true);
            }
        });
    };

    /**
     * Check session activity
     * Checks the inactive and max life time of session.
     * Is the time exceeded then regenerated the session.
     *
     * @param {Object} session a session for check
     * @param {Function} callback a callback function with error and bool
     */
    pub.checkActivitySession = function (session, callback) {

        if (typeof session !== 'object') {
            throw new SessionError('Parameter session is required and must be a object type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        //check session activity time
        var activity = new Date(session.activity);
        var start = new Date(session.start);
        var end = new Date();
        var inactiveDifference = (end - activity) / 1000;
        var maxDifference = (end - start) / 1000;

        // check activity time
        if (config.session.inactiveTime < inactiveDifference || config.session.maxLife < maxDifference) {

            // to long inactive, regenerate session
            session.regenerate(function () {

                syslog.warn('session too long inactive or session expired, regenerate session.');
                callback(null, false);
            });
        }
        else {

            // session ok, renewal activity time
            session.activity = new Date();
            callback(null, true);
        }
    };

    // API for transport

    /**
     * Save actual time as activity in session
     *
     * @param {!Object} data a container for parameters
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and bool
     */
    pub.setActivity = function (data, request, callback) {

        pub.checkActivitySession(request.session, function (error, result) {
            if (!error && result) {
                request.setSession(callback);
            }
            else {

                var activityError = error || new SessionError(
                        'Session too long inactive or session expired, regenerate session.', 400);

                request.setSession(function (error, result) {

                    if (!error && result) {
                        callback(activityError);
                    }
                    else {
                        callback(error || new SessionError('Unknown session error in setSession', 400));
                    }
                });
            }
        });
    };

    /**
     * Get last session activity
     *
     * @param {!Object} data a object for parameters
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and object with activity time
     */
    pub.getLastActivity = function (data, request, callback) {

        if (!request.session.hasOwnProperty('activity')) {
            callback(new SessionError('Property activity not found in session', 400));
        }
        else {
            callback(null, {activity: request.session.activity});
        }
    };

    /**
     * Read data from session container data
     *
     * @param {!Object} data a object for parameters key or empty
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and object with data
     */
    pub.getData = function (data, request, callback) {

        if (!request.session.data) {
            request.session.data = {};
        }

        var key = data.key;
        var obj = {};

        if (typeof key === 'undefined') {
            obj = request.session.data;
        }
        else {
            // check own key
            if (!request.session.data.hasOwnProperty(key)) {
                return callback(new SessionError('Key: ' + key + ' not found in session container', 400));
            }
            else {
                obj[key] = request.session.data[key];
            }
        }

        return callback(null, obj);
    };

    /**
     * Store data in session container data
     *
     * @param {!Object} data a object for parameters key value
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and bool
     */
    pub.setData = function (data, request, callback) {

        // check params
        if (!data.key) {
            return callback(new SessionError('Parameter key is required', 400));
        }

        if (!data.value) {
            return callback(new SessionError('Parameter value is required', 400));
        }

        if (!request.session.data) {
            request.session.data = {};
        }

        // save key value in session
        request.session.data[data.key] = data.value;

        request.setSession(function (error, result) {

            if (!error && result) {
                callback(null, data.key + ' is saved in session');
            }
            else {
                callback(error || new SessionError('Unknown session error in setSession', 400));
            }
        });
    };

    /**
     * Delete data from session container
     *
     * @param {!Object} data a object for parameters key or empty
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and message
     */
    pub.deleteData = function (data, request, callback) {

        if (!request.session.data) {
            request.session.data = {};
            return callback(null, 'container session.data deleted');
        }

        var key = data.key;

        if (typeof key === 'undefined') {
            request.session.data = {};
            return callback(null, 'container session.data deleted');
        }

        // check own key
        if (!request.session.data.hasOwnProperty(key)) {
            return callback(new SessionError('Key: ' + key + ' not found in session container', 400));
        }
        else {
            // delete key value in session
            delete request.session.data[key];
            return callback(null, key + ' is deleted in session');
        }
    };

    /**
     * Get user information
     * Information: isLoggedIn, username, rightsEnabled
     *
     * @param {!Object} data a object for parameters empty
     * @param {!Object} request a request object
     * @param {!Function} callback a callback function with error and user information object
     */
    pub.getUserDataForClient = function (data, request, callback) {

        var displayName = request.session.user.display_name || request.session.user.name;

        var user = {
            isLoggedIn: request.session.loggedIn,
            username: displayName,
            rightssystem: rightsEnabled
        };

        callback(null, user);
    };

    return pub;
};
