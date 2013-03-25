module.exports = function (syslog) {
    'use strict';

    var pub = {};

    pub.developmentHandler = function (err, req, res, next) {
        next = null;
        // view error page
        res.status(500);
        var stack = err.stack;
        stack = stack.split('\n');

        syslog.error(stack);
        console.log(err.status);
        res.render('error', {
            title: 'Baboon',
            msg: err.message,
            trace: stack
        });
    };

    pub.productionHandler = function (err, req, res, next) {
        next = null;
        // view error page
        res.status(500);
        res.render('500');
        // log error in console
        syslog.error(err.stack);
    };

    return pub;
};
