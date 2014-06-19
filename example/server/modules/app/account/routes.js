'use strict';

module.exports = function (baboon, router) {
    router.get('/account/*', function (req, res) {
        res.render('app/account/index');
    });

    return router;
};