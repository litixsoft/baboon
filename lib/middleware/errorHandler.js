module.exports = function (syslog) {
    'use strict';

    var pub = {};

    pub.developmentHandler = function (err, req, res, next) {
        next = null;
        // view error page
        res.status(500);
        var stack = err.stack;
        stack = stack.split('\n');
        syslog.error('500:', err);
        res.render('status/error', {
            title: 'Baboon',
            msg: err.message,
            trace: stack
        });
    };

    pub.productionHandler = function (err, req, res, next) {
        next = null;
        // view error page
        res.status(500);
        res.render('status/500');
        // log error in console
        syslog.error('500:', err);
    };

    return pub;
};
