'use strict';

module.exports = function (app) {
    var pub = {},
        session = app.session,
        config = app.config;


    pub.getAll = function (data, callback) {

        delete session.user.salt;
        delete session.user.hash;

        callback(session);
    };

    pub.isAuthenticated = function (data, callback) {
        if (session.user && session.user.id !== -1) {
            callback(true);
        }
        else {
            callback(false);
        }
    };

    pub.setActivity = function (data, callback) {
        // is an active session
        if (session.user && session.activity) {
            // check inactive time
            var start = new Date(session.activity);
            var end = new Date();
            var difference = (end - start) / 1000;
            //noinspection JSUnresolvedVariable
            if (config.sessionActivityTime < difference) {
                // to long inactive, regenerate session
                session.destroy();
                callback(null, false);
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
