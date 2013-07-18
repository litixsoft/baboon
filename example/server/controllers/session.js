'use strict';

module.exports = function (app, session) {
    var pub = {},
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    if (session.user) {
        delete session.user.hash;
        delete session.user.salt;
    }

    pub.getAll = function (data, callback) {
        callback(null, session);
    };

    pub.getData = function (key, callback) {
        var i, max;
        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
            if (key === sessionProtectedKeys[i]) {
                return callback('error: ' + key + ' is protected');
            }
        }

        return callback(null, session[key]);
    };

    pub.setData = function (data, callback) {
        var i, max;
        for (i = 0, max = sessionProtectedKeys.length; i < max; i++) {
            if (data.key === sessionProtectedKeys[i]) {
                return callback('error: ' + data.key + ' is protected');
            }
        }

        session[data.key] = data.value;
        return callback(null, true);
    };

    return pub;
};
