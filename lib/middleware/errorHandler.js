'use strict';

var NavigationError = require('../errors').NavigationError;

module.exports = function (syslog) {

    //var env = process.env.NODE_ENV || 'development';

    /**
     * Helper for create and send an api error
     *
     * @param err
     * @param req
     * @param res
     */
    var apiError = function(err, req, res) {

        // check status
        if (err.status) {
            res.statusCode = err.status;
        }
        if (res.statusCode < 400) {
            res.statusCode = 500;
        }

        // create error object
        var error = {
            name: err.name,
            resource: err.resource,
            statusCode: res.statusCode,
            message: err.message
        };

        // send error
        var json = JSON.stringify({error: error});
        res.setHeader('Content-Type', 'application/json');
        res.end(json);
    };

    /**
     * Error handler for express server
     *
     * @param err
     * @param req
     * @param res
     * @param next
     */
    var errorHandler = function(err, req, res, next) {

        // log error
        syslog.error(err.stack);

        // check errors
        if (err instanceof NavigationError) {

            // Navigation is rest api error
            apiError(err, req, res);
        }
        else {
            next();
        }
    };

    return errorHandler;
};