module.exports = function () {
    'use strict';

    var pub = {};

    pub.index = function(req, res) {
        var isAuth = false;

        if(req.session.user.id !== -1) {
            isAuth = true;
        }

        res.locals.isAuth = isAuth;
        res.locals.username = req.session.user.name;
    };

    pub.login = function(req, res) {
        var err = req.session.error,
            msg = req.session.success;

        delete req.session.error;
        delete req.session.success;

        res.locals.showMsg = false;

        if (err) {
            res.locals.sessionMsgClass = 'loginError';
            res.locals.sessionMsg = err;
            res.locals.showMsg = true;
        }
        if (msg) {
            res.locals.sessionMsgClass = 'loginSuccess';
            res.locals.sessionMsg = msg;
            res.locals.showMsg = true;
        }
    };

    return pub;
};
