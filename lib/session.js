'use strict';
var SessionError = require('./errors').SessionError;
var sessionstore = require('sessionstore');
var cookies = require('express/node_modules/cookie');
var connectUtils = require('express/node_modules/connect/lib/utils');

module.exports = function (config, syslog) {

    // check parameters
    if (typeof config !== 'object') {
        throw new SessionError('Parameter config is required and must be a object type!');
    }
    if (typeof syslog !== 'object') {
        throw new SessionError('Parameter syslog is required and must be a object type!');
    }
    if (typeof config.stores !== 'object') {
        throw new SessionError('Parameter config.stores is required and must be a object type!');
    }
    if (typeof config.activeStore !== 'string') {
        throw new SessionError('Parameter config.activeStore is required and must be a object type!');
    }
    if (typeof config.secret !== 'string') {
        throw new SessionError('Parameter config.secret is required and must be a object type!');
    }
    if (typeof config.key !== 'string') {
        throw new SessionError('Parameter config.key is required and must be a object type!');
    }

    var pub = {};
    var activeStore = config.stores[config.activeStore];
    var key = config.key;
    var secret = config.secret;

    // create session store
    var sessionStore = sessionstore.createSessionStore(activeStore);

    /**
     * Get session store
     *
     * @returns {*}
     */
    pub.getSessionStore = function() {
        return sessionStore;
    };

    /**
     * Get sessionId from signed cookie
     *
     * @param cookie
     */
    pub.getSessionId = function(cookie) {

        if (typeof cookie !== 'string') {
            throw new SessionError('Parameter cookie is required and must be a string type!');
        }

        var signedCookies = cookies.parse(cookie);
        return connectUtils.parseSignedCookies(signedCookies, secret)[key];
    };

    /**
     * Get session from session store with cookie
     *
     * @param cookie
     * @param callback
     */
    pub.getSession = function(cookie, callback) {

        if (typeof cookie !== 'string') {
            throw new SessionError('Parameter cookie is required and must be a string type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        var sid = pub.getSessionId(cookie);

        sessionStore.get(sid, function (error, session) {
            if (error || !session) {
                callback(error || new SessionError('session ' + sid + ': not found'));
            }
            else {

                // set _sessionid fix for in memory
                if (!session.hasOwnProperty('_sessionid')) {
                    session._sessionid = sid;
                    callback(null, session);
                }
                else {
                    callback(null, session);
                }
            }
        });
    };

    /**
     * Save session in store
     *
     * @param session
     * @param callback
     */
    pub.setSession = function(session, callback) {

        if (typeof session !== 'object') {
            throw new SessionError('Parameter session is required and must be a object type!');
        }

        if (typeof callback !== 'function') {
            throw new SessionError('Parameter callback is required and must be a object type!');
        }

        sessionStore.set(session._sessionid, session, function(error) {

            if(error) {
                callback(new SessionError(error));
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
     * @param session
     * @param callback
     */
    pub.checkActivitySession = function(session, callback) {

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
        if (config.inactiveTime < inactiveDifference || config.maxLife < maxDifference) {

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

    return pub;
};
