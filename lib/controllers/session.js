'use strict';

/**
 * The blog api.
 *
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (app) {
    var pub = {};

    /**
     * sdadadad
     *
     * @roles Admin, Guest
     */
    pub.logFromSession = function () {
        app.logging.syslog.debug('session from lib');
    };

    return pub;
};