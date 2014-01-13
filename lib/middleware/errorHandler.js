'use strict';

module.exports = function (syslog) {

    var env = process.env.NODE_ENV || 'development';

    var getErrorMsg = function(err) {

        if (env === 'development') {
            return err;
        }
        else {
            return '500 Internal Server Error';
        }
    };

    var errorHandler = function(err, req, res, next) {

        syslog.error(err.stack);
        var accept = req.headers.accept || '';

        if (accept.indexOf('html')) {
            next();
        }
        else if (accept.indexOf('json')) {

            if (err.status) {
                res.statusCode = err.status;
            }
            if (res.statusCode < 400) {
                res.statusCode = 500;
            }

            var json = JSON.stringify({ error: getErrorMsg(err.stack) });
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        }
        else {
            res.setHeader('Content-Type', 'text/plain');
            res.end(err.stack);
        }
    };

    return errorHandler;
};