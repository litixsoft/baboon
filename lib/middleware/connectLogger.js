'use strict';
var log4js = require('log4js');

/**
 * Get baboon connect logger
 *
 * @param config
 * @param logger
 * @returns {*}
 */
module.exports = function (env, logger) {

    if (env === 'production') {
        return log4js.connectLogger(logger, {level: 'auto'});
    }
    else {
        return log4js.connectLogger(logger, {level: 'auto', format: ':status :method :url'});
    }
};