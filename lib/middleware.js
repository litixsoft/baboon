module.exports = (function () {
    'use strict';

    //noinspection JSUnresolvedVariable
    var serverMode = bbConfig.serverMode,
        pub = {};

    //noinspection JSUnresolvedVariable
    pub.auth = require('./auth');

    pub.errorHandler = function (err, req, res, next) {
        next = null;
        if (serverMode === 'production') {
            // view error page
            res.status(500);
            res.render('500');
            // log error in console
            console.error(err.stack);

        } else {
            // view error page
            res.status(500);
            var stack = err.stack;
            stack = stack.split('\n');

            console.dir(err.status);
            res.render('error', {
                title: 'Baboon',
                msg: err.message,
                trace: stack
            });
        }
    };

    return pub;
})();
