'use strict';

module.exports = function (baboon, router) {
    var auth = baboon.middleware.auth;

    router.get('/demo', auth.restricted, function (req, res) {
        res.render('app/demo/index');
    });

    router.get('/demo/*', auth.restricted, function (req, res) {
        res.render('app/demo/index');
    });

    return router;
};
