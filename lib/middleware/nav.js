'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (app) {
    var pub = {};

    pub.setNavData = function (req) {
        var user = req.session.user;
        var navigation = app.config.path.navigation ? require(app.config.path.navigation) : null;
        var userNavigation = app.rights.secureNavigation(user, navigation);
        var administrationArea = null;

        // remove baboon administration area from navigation when rights system is disabled
        if (app.config.useRightsSystem === false) {
            administrationArea = lxHelpers.arrayFirst(userNavigation, function (item) {
                return item.title === 'ADMINISTRATION' && item.target === '_self';
            });
        }

        if (administrationArea) {
            lxHelpers.arrayRemoveItem(userNavigation, administrationArea);
        }

        req.session.navigation = userNavigation;
    };

    pub.getNavData = function (req, res) {
        if (!req.session.navigation) {
            res.json({error: 'no navigation found in session!'});
            return;
        }

        res.json({error: null, data: req.session.navigation});
    };

    return pub;
};