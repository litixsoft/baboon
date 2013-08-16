'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (rights, config) {
    var pub = {},
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    function addGuestUserToSession (session, callback) {
        session.activity = new Date();
        session.start = new Date();

        if (config.useRightsSystem) {
            rights.data().getUser(-1, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                if (lxHelpers.isEmpty(result)) {
                    callback({code: 3, message: 'guest user not found'});
                    return;
                }

                session.user = result;
                callback();
            });
        } else {
            session.user = {id: -1, name: 'guest'};
            callback();
        }
    }

    /**
     * Checks if a user exists and if the session is expired or inactive.
     *
     * @param {!Object} req The request object.
     * @param {!Object} res The response object.
     * @param {function({code: number, message: string}=)} callback The callback.
     */
    pub.checkSession = function (req, res, callback) {
        // check if session exists
        if (typeof req.session.user === 'undefined') {
            // session not exists, start new guest session
            addGuestUserToSession(req.session, function (error) {
                callback(error || {code: 1, message: 'session not exists, start new guest session'});
            });

//            req.session.user = {id: -1, name: 'guest'};
//            req.session.activity = new Date();
//            req.session.start = new Date();
//
//            callback({code: 1, message: 'session not exists, start new guest session'});
        } else {
            // check session activity time
            var activity = new Date(req.session.activity),
                start = new Date(req.session.start),
                end = new Date(),
                inactiveDifference = (end - activity) / 1000,
                maxDifference = (end - start) / 1000;

            // check activity time
            if (config.sessionInactiveTime < inactiveDifference || config.sessionMaxLife < maxDifference) {
                // to long inactive, regenerate session
                req.session.regenerate(function () {
                    addGuestUserToSession(req.session, function (error) {
                        callback(error || {code: 2, message: 'to long inactive or session expired, regenerate session'});
                    });

//                    req.session.user = {id: -1, name: 'guest'};
//                    req.session.activity = new Date();
//                    req.session.start = new Date();
//
//                    callback({code: 2, message: 'to long inactive or session expired, regenerate session'});
                });
            } else {
                // session ok, renewal activity time
                req.session.activity = new Date();

                callback();
            }
        }
    };

    // check session and set activity
    pub.setActivity = function (req, res) {
        pub.checkSession(req, res, function (error) {
            if (error) {
                if (error.code) {
                    res.json(403, error.message);
                } else {
                    res.json(500, {'message': 'checkSession: unknown error'});
                }
            } else {
                // send ok
                res.json(200, {});
            }
        });
    };

    // get session data
    pub.getData = function (req, res) {
        var key = req.body.key;

        // check protected keys
        if (lxHelpers.arrayHasItem(sessionProtectedKeys, key)) {
            return res.json(403, {message: key + ' is protected'});
        }

        // check own key
        if (!req.session.hasOwnProperty(key)) {
            return res.json(200, {message: key + ' not found in session'});
        }

        var obj = {};
        obj[key] = req.session[key];

        return res.json(200, obj);
    };

    // set session data
    pub.setData = function (req, res) {
        var key = req.body.key,
            value = req.body.value;

        // check protected keys
        if (lxHelpers.arrayHasItem(sessionProtectedKeys, key)) {
            return res.json(403, {message: key + ' is protected'});
        }

        // save key value in session
        req.session[key] = value;

        return res.json(200, {message: key + ' is saved in session'});
    };

    return pub;
};
