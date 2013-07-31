'use strict';
var pwd = require('pwd');

module.exports = function (sessionInactiveTime, sessionMaxLife) {
    var pub = {},
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    function isExpired (start, timer) {
        var now = new Date(),
            startDate = new Date(start),
            difference = (now - startDate) / 1000;

        return timer < difference;
    }

    pub.checkSession = function (req, res, callback) {
        // guest
        var user = {id: -1, name: 'guest'};

        // check if session exists
        if (typeof req.session.user === 'undefined') {
            // session not exists start new guest session
            req.session.user = user;
            req.session.activity = new Date();
            req.session.start = new Date();
            req.session.isExpired = isExpired;

            callback({error: 1, message: 'session not exists start new guest session'});
        } else {
            // check session activity time
            var activity = new Date(req.session.activity);
            var start = new Date(req.session.start);
            var end = new Date();
            var difference = (end - activity) / 1000;
            var maxDifference = (end - start) / 1000;

            // check activity time
            if (sessionInactiveTime < difference || sessionMaxLife < maxDifference) {
                // to long inactive, regenerate session
                req.session.regenerate(function () {
                    req.session.user = user;
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    callback({error: 2, message: 'to long inactive, regenerate session'});
                });
            }
            else {
                // session ok renewal activity time
                req.session.activity = new Date();

                callback(null);
            }
        }
    };

    // check session and set activity
    pub.setActivity = function(req, res) {

        pub.checkSession(req, res, function(err){
            if(err) {
                if(err.error === 1 || err.error === 2) {
                    res.json(403, err.message);
                }
                else {
                    res.json(500, {'message': 'checkSession: unknown error'});
                }
            }
            else {
                res.json(200, {'message': 'new activity time was set'});
            }
        });
    };

    // get session data
    pub.getData = function(req, res) {

        var i,
            max,
            key = req.body.key;

        // check protected keys
        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
            if (key === sessionProtectedKeys[i]) {
                return res.json(403,{message: key + ' is protected'});
            }
        }

        // check own key
        if(! req.session.hasOwnProperty(key)) {
            return res.json(403,{message: key + ' not found in session'});
        }

        var obj = {};
        obj[key] = req.session[key];

        return res.json(200, obj);
    };

    // set session data
    pub.setData = function (req, res) {

        var i,
            max,
            key = req.body.key,
            value = req.body.value;

        // check protected keys
        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
            if (key === sessionProtectedKeys[i]) {
                return res.json(403,{message: key + ' is protected'});
            }
        }

        // check own key
        if(req.session.hasOwnProperty(key)) {
            return res.json(403,{message: key + ' already exists in session'});
        }

        // save key value in session
        req.session[key] = value;

        return res.json(200,{message: key + ' is saved in session'});
    };

    return pub;
};
