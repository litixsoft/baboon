module.exports = function (appName) {
    'use strict';

    var pub = {};

    pub.siteContext = function (req, res, next) {
        var err = req.session.error,
            msg = req.session.success;

        delete req.session.error;
        delete req.session.success;

        if (err) {
            res.locals.sessionMsgClass = 'error';
            res.locals.sessionMsg = err;
        }
        if (msg) {
            res.locals.sessionMsgClass = 'success';
            res.locals.sessionMsg = msg;
        }

        res.locals.username = req.session.user.name;
        res.locals.activity = req.session.activity;
        res.locals.sid = req.sessionID;
        res.locals.appName = appName;

        next();
    };

    return pub;
};