module.exports = function () {
    'use strict';

    var pub = {};

    pub.index = function(req, res) {
        var isAuth = false,
            user = req.session.user,
            username = 'guest';

        if(typeof user !== 'undefined') {
            if(user.id !== -1) {
                isAuth = true;
            }

            username = user.name;
        }

        res.locals.isAuth = isAuth;
        res.locals.username = username;
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
