'use strict';

module.exports = function (baboon, router) {
    var auth = baboon.middleware.auth;

    router.get('/admin', auth.restrictedAdmin, function (req, res) {
        res.render('app/admin/index');
    });

    router.get('/admin/*', auth.restrictedAdmin, function (req, res) {
        res.render('app/admin/index');
    });

    return router;
};
