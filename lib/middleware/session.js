'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (rights, config) {
    var pub = {};

    function addGuestUserToSession (session, callback) {
        session.activity = new Date();
        session.start = new Date();

        if (config.useRightsSystem) {
            rights.getUser(-1, function (error, result) {
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
            session.user = {id: -1, username: 'guest'};
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

    // get last activity
    pub.getLastActivity = function (req, res) {
        // check own key
        if (!req.session.hasOwnProperty('activity')) {
            return res.json(200, {message: 'activity not found in session'});
        }

        return res.json(200, {activity: req.session.activity});
    };

    // get session data
    pub.getData = function (req, res) {
        if (!req.session.data) {
            req.session.data = {};
        }

        var key = req.body.key,
            obj = {};

        if (typeof key === 'undefined') {
            obj = req.session.data;
        }
        else {
            // check own key
            if (!req.session.data.hasOwnProperty(key)) {
                return res.json(200, {message: key + ' not found in session'});
            }

            obj[key] = req.session.data[key];
        }

        return res.json(200, obj);
    };

    // set session data
    pub.setData = function (req, res) {

        if (!req.session.data) {
            req.session.data = {};
        }

        // save key value in session
        req.session.data[req.body.key] = req.body.value;

        res.json(200, {message: req.body.key + ' is saved in session'});
    };

    // delete session data
    pub.deleteData = function (req, res) {
        if (!req.session.data) {
            req.session.data = {};
        }

        var key = req.body.key;

        if (typeof key === 'undefined') {
            req.session.data = {};

            res.json(200, {message: 'container session.data deleted'});
        }
        else {
            // check own key
            if (!req.session.data.hasOwnProperty(key)) {
                res.json(200, {message: key + ' not found in session'});
            }
            else {
                // delete key value in session
                delete req.session.data[key];

                res.json(200, {message: key + ' is deleted in session'});
            }
        }
    };

    /**
     * getAuthData
     * gets isAuth bool and the username
     *
     * @param req
     * @param res
     */
    pub.getAuthData = function (req, res) {

        var isAuth = false;
        var username;

        // check if guest
        if (req.session.user.id !== -1) {
            isAuth = true;
        }

        if (! req.session.user.displayName) {
            username = req.session.user.username;
        }
        else {
            username = req.session.user.displayName;
        }


        res.json(200, {isAuth:isAuth, username: username});
    };

    return pub;
};
