'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (sessionInactiveTime, sessionMaxLife) {
    var pub = {},
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    /**
     * Checks if a user exists and if the session is expired or inactive.
     *
     * @param {!Object} req The request object.
     * @param {!Object} res The response object.
     * @param {function({})} callback The callback.
     */
    pub.checkSession = function (req, res, callback) {
        // check if session exists
        if (typeof req.session.user === 'undefined') {
            // session not exists, start new guest session
            req.session.user = {id: -1, name: 'guest'};
            req.session.activity = new Date();
            req.session.start = new Date();

            callback({error: 1, message: 'session not exists, start new guest session'});
        } else {
            // check session activity time
            var activity = new Date(req.session.activity),
                start = new Date(req.session.start),
                end = new Date(),
                inactiveDifference = (end - activity) / 1000,
                maxDifference = (end - start) / 1000;

            // check activity time
            if (sessionInactiveTime < inactiveDifference || sessionMaxLife < maxDifference) {
                // to long inactive, regenerate session
                req.session.regenerate(function () {
                    req.session.user = {id: -1, name: 'guest'};
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    callback({error: 2, message: 'to long inactive or session expired, regenerate session'});
                });
            } else {
                // session ok, renewal activity time
                req.session.activity = new Date();

                callback(null);
            }
        }
    };

    // check session and set activity
    pub.setActivity = function (req, res) {
        pub.checkSession(req, res, function (err) {
            if (err) {
                if (err.error === 1 || err.error === 2) {
                    res.json(403, err.message);
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
