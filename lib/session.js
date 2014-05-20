'use strict';
var SessionError = require('./errors').SessionError;
var sessionstore = require('sessionstore');
var cookies = require('express-session/node_modules/cookie');
var parseSignedCookie = require('cookie-parser/lib/parse').signedCookies;

/**
 * Session
 * Library for session management.
 * Works only on REST.
 *
 * @param baboon
 * @returns {{}}
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
     * Get session store
     *
     * @returns {*}
     */
    pub.getSessionStore = function () {
        return sessionStore;
    };

    /**
     * Get sessionId from signed cookie
     *
     * @param {String} cookie
     */
    pub.getSessionId = function (cookie) {

        if (typeof cookie !== 'string') {
            throw new SessionError('Parameter cookie is required and must be a string type!');
        }

        var signedCookie = cookies.parse(cookie);
        return parseSignedCookie(signedCookie, secret)[key];
    };

    /**
     * Get session from session store with cookie
     *
     * @param {String} cookie
     * @param {Function} callback
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
     * Get session from session store with cookie
     *
     * @param {String} sid
     * @param {Function} callback
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
     * Save session in store
     *
     * @param {Object} session
     * @param {Function} callback
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
     * @param {Object} session
     * @param {Function} callback
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
     * setActivity
     * Report activity to session
     *
     * @param {!Object} data
     * @param {!Object} request
     * @param {!Function} callback
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
     * getLastActivity
     * Get last session activity
     *
     * @param {!Object} data
     * @param {!Object} request
     * @param {!Function} callback
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
     * getData
     * Read data from session container data
     *
     * @param {!Object} data
     * @param {!Object} request
     * @param {!Function} callback
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
     * setData
     * Store data in the session container data
     *
     * @param {!Object} data
     * @param {!Object} request
     * @param {!Function} callback
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
     * deleteData
     * Delete data from session container
     *
     * @param {!Object} data
     * @param {!Object} request
     * @param {!Function} callback
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
     * getUserDataForClient
     * Returns object with user data
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getUserDataForClient = function(data, request, callback) {

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
