'use strict';

var AuthError = require('../errors').AuthError;

/**
 *
 *
 * @param {!Object} config
 * @param {!Object} syslog
 * @returns {{errorHandler: errorHandler}}
 */
module.exports = function (config, syslog) {

    var appName = config.app_name;
    var env = config.node_env;

    var htmlHandler = function (err, req, res, next) {

        next = null;

        var errorTitle = 'Error: ' + appName;
        var errorCode = 500;
        var errorMessage = 'Internal server error';
        var errorStack = [];

        // overwrite statusCode and errorMessage
        if (env === 'development' || err.displayClient) {

            if (err.status && err.message) {
                errorCode = err.status;
                errorMessage = err.message;
            }
        }

        // define errorStack only in development mode
        if (env === 'development') {
            errorStack = err.stack;
        }

        // log error
        syslog.error(err.stack);

        // html for error page
        var html = '<html><head><meta charset=\'utf-8\'><title>' + errorTitle + '</title>' +
            '<style>*{margin:0;padding:0;outline:0}body{padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande","Arial";' +
            'background:#ece9e9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ece9e9));' +
            'background:#ece9e9 -moz-linear-gradient(top,#fff,#ece9e9);background-repeat:no-repeat;color:#555;' +
            '-webkit-font-smoothing:antialiased}h1,h2,h3{font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;' +
            'font-weight:normal}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;' +
            'border-bottom:1px solid #eee;font-size:18px}ul li{list-style:none}ul li:hover{cursor:pointer;' +
            'color:#2e2e2e}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}@media(max-width:768px){body{font-size:13px;' +
            'line-height:16px;padding:0}}</style></head><body><div id="wrapper"> <h1>' + appName + '</h1> ' +
            '<h2><em>' + errorCode + '</em>' + errorMessage + '</h2> <ul id="stacktrace">' + errorStack + '</ul></div></body></html>';

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);

    };

    /**
     * jsonHandler
     * Error handler for json requests
     *
     * @param error
     * @param req
     * @param res
     * @param next
     */
    var jsonHandler = function (error, req, res, next) {
        next = null;

        var status = error.status;

        if (status < 400) {
            status = 500;
        }

        // log error
        syslog.error(error.stack);
        res.status(status).json(error);
    };

    /**
     * Error handler for express server
     *
     * @param err
     * @param req
     * @param res
     * @param next
     */
    var errorHandler = function (err, req, res, next) {

        if (err instanceof AuthError) {
            jsonHandler(err, req, res, next);
        }
        else {
            htmlHandler(err, req, res, next);
        }
    };

    return {
        errorHandler: errorHandler
    };
};