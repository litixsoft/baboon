'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (rights, config) {
    var pub = {};

    pub.index = function (req, res) {
        var isAuth = false,
            user = req.session.user,
            navigation = require(config.path.navigation),
            userNavigation = rights.secureNavigation(user, navigation),
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

        // save navigation in session
        req.session.navigation = userNavigation;

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
