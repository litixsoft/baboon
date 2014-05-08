'use strict';

module.exports = function (baboon) {

    var pub = {};
    var config = baboon.config;
    var rights = baboon.rights;

    pub.restrictedUser = function (req, res, next) {

        // check session and user when rights is enabled and masterLoginPage is true
        if (config.rights.enabled && config.rights.masterLoginPage) {

            if (req.session.user && rights.userIsInRole(req.session.user, 'User')) {
                next();
            }
            else {
                //res.redirect('/login');
                res.send(404, 'Access denied');
            }
        }
        else {
            next();
        }
    };

    pub.restrictedAdmin = function (req, res, next) {

        // check session and user when rights is enabled and masterLoginPage is true
        if (config.rights.enabled && config.rights.masterLoginPage) {

            if (req.session.user && rights.userIsInRole(req.session.user, 'Admin')) {
                next();

            }
            else {
                //res.redirect('/login');
                res.send(404, 'Access denied');
            }
        }
        else {
            next();
        }
    };

    return pub;
};