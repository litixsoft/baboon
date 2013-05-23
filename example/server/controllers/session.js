'use strict';

module.exports = function (app) {
    var pub = {};

    pub.getAll = function (data, callback) {

        var session = {
            user: app.session.user,
            success: app.session.success,
            activity: app.session.activity,
            sessionID: app.session.sessionID
        };

        delete session.user.salt;
        delete session.user.hash;

        callback(session);
    };

    return pub;
};
