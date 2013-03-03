module.exports = function (config) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var mode = config.config,
        pub = {};

    //noinspection JSUnresolvedVariable
    pub.auth = require('./auth')(config);

    pub.errorHandler = function (err, req, res, next) {
        next = null;
        if (mode === 'base') {
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
};
