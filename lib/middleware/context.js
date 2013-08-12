'use strict';

module.exports = function (rights, config) {
    var pub = {};

    pub.index = function (req, res) {
        var isAuth = false,
            user = req.session.user,
            navigation = require(config.path.navigation),
            userNavigation = rights.secureNavigation(user, navigation),
            username = 'guest';

        if (typeof user !== 'undefined') {
            if (user.id !== -1) {
                isAuth = true;
            }

            username = user.name;
        }

        // save navigation in session
        req.session.navigation = userNavigation;

        // add locals to response
        res.locals.isAuth = isAuth;
        res.locals.username = username;
        res.locals.navigation = JSON.stringify(userNavigation);
    };

    pub.login = function (req, res) {
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
