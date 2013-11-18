'use strict';

module.exports = function (app) {
    var pub = {};

    /**
     * sdadadad
     *
     * @roles Admin, Guest
     */
    pub.log = function () {
        app.logging.syslog.debug('auth from lib');
    };

    return pub;
};