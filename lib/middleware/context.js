'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (app) {
    var pub = {};

    pub.index = function (req, res) {
        var isAuth = false,
            user = req.session.user,
            navigation = app.config.path.navigation ? require(app.config.path.navigation) : null,
            userNavigation = app.rights.secureNavigation(user, navigation),
            username = 'guest',
            topLevelNavigation = [];

        if (typeof user !== 'undefined') {
            if (user.id !== -1) {
                isAuth = true;
            }

            username = user.name;
        }

        // extract top level navigation links
        lxHelpers.forEach(userNavigation, function(navItem) {
            var topLevelLink = lxHelpers.clone(navItem);
            delete topLevelLink.children;

            topLevelNavigation.push(topLevelLink);
        });

        // save navigation and isAuth in session
        req.session.navigation = userNavigation;
        req.session.isAuth = isAuth;

        // add locals to response
        res.locals.isAuth = isAuth;
        res.locals.username = username;
        res.locals.navigation = userNavigation;
        res.locals.topLevelNavigation = topLevelNavigation;
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
