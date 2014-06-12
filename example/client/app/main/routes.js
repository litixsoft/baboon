'use strict';

module.exports = function (baboon, router) {
    var auth = baboon.middleware.auth;

    router.get('*', auth.restrictedUser, function (req, res) {
        res.render('app/main/index');
    });

    return router;
};
