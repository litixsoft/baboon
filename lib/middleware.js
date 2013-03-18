module.exports = function (config, syslog) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var pub = {};

    //noinspection JSUnresolvedVariable
    pub.auth = require('./auth')(config);

    pub.errorDevelopmentHandler = function (err, req, res, next) {
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

    pub.errorProductionHandler = function (err, req, res, next) {
        next = null;

        // view error page
        res.status(500);
        res.render('500');
        // log error in console
        syslog.error(err.stack);
    };

    return pub;
};
