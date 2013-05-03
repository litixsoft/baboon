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
//        res.render('status/error', {
//            title: 'Baboon',
//            msg: err.message,
//            trace: stack
//        });
        res.send('<h2>500: '+ err.message +'</h2>'+ err.stack);
    };

    pub.productionHandler = function (err, req, res, next) {
        next = null;
        // view error page
        res.status(500);
        //res.render('status/500');
        res.send('<h2>500 Internal Error</h2>' +
            '<p>Couldn\'t retrieve the view because of server-configuration problems.' +
            ' Please contact site administrator.</p>');
        // log error in console
        syslog.error('500:', err);
    };

    return pub;
};
