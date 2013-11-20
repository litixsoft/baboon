'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (app) {
    var pub = {};

    pub.setNavData = function (req) {
        var user = req.session.user;
        var navigation = app.config.path.navigation ? require(app.config.path.navigation) : null;
        var userNavigation = app.rights.secureNavigation(user, navigation);
        var topLevelNavigation = [];

        // extract top level navigation links
        lxHelpers.forEach(userNavigation, function(navItem) {
            var topLevelLink = lxHelpers.clone(navItem);
            delete topLevelLink.children;

            topLevelNavigation.push(topLevelLink);
        });

        req.session.navigation = userNavigation;
    };

    pub.getNavData = function (req, res) {

        if (! req.session.navigation) {
            res.json({error: 'no navigation found in session!'});
            return;
        }

        res.json({error: null, data: req.session.navigation});
    };

    return pub;
};