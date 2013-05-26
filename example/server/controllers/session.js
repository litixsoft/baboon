'use strict';

module.exports = function (app, session) {
    var pub = {},
        config = app.config,
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    delete session.user.hash;
    delete session.user.salt;

    pub.getAll = function (data, callback) {
        callback(null, session);
    };

    pub.getData = function(key, callback) {
        var i, max;
        for(i = 0, max = sessionProtectedKeys.length; i < max; i++ ) {
            if(key === sessionProtectedKeys[i]) {
                return callback('error: ' + key + ' is protected');
            }
        }

        return callback(null, session[key]);
    };

    pub.setData = function(data, callback) {
        var i, max;
        for(i = 0, max = sessionProtectedKeys.length; i < max; i++ ) {
            if(data.key === sessionProtectedKeys[i]) {
                return callback('error: ' + data.key + ' is protected');
            }
        }

        session[data.key] = data.value;
        return callback(null, true);
    };

    pub.setActivity = function (data, callback) {
        // is an active session
        if (session.user && session.activity) {
            // check inactive time
            var start = new Date(session.activity);
            var end = new Date();
            var difference = (end - start) / 1000;
            //noinspection JSUnresolvedVariable
            if (config.sessionInactiveTime < difference) {
                // to long inactive, regenerate session
                callback('to long inactive');

            } else {
                // session ok set new activity
                session.activity = new Date();
                callback(null, true);
            }
        } else {
            // session not exists
            callback('session not exists');
        }
    };

    return pub;
};
