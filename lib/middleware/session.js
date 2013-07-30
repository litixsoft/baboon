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
    pub.activity = function(req, res) {

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


    pub.getAll = function (data, callback) {
        //callback(null, session);
    };

    pub.getData = function (key, callback) {
//        var i, max;
//        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
//            if (key === sessionProtectedKeys[i]) {
//                return callback('error: ' + key + ' is protected');
//            }
//        }
//
//        return callback(null, session[key]);
    };

    pub.setData = function (data, callback) {
//        var i, max;
//        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
//            if (data.key === sessionProtectedKeys[i]) {
//                return callback('error: ' + data.key + ' is protected');
//            }
//        }
//
//        session[data.key] = data.value;
//        return callback(null, true);
    };

    return pub;
};
