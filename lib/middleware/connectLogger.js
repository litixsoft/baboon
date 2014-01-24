'use strict';
var log4js = require('log4js');

/**
 * Get baboon connect logger
 *
 * @param logger
 * @returns {*}
 */
module.exports = function (logger) {

    var env = process.env.NODE_ENV || 'development';

    if (env === 'production') {
        return log4js.connectLogger(logger, {level: 'auto'});
    }
    else {
        return log4js.connectLogger(logger, {level: 'auto', format: ':status :method :url'});
    }
};