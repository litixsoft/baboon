'use strict';

module.exports = function (app) {
    var pub = {},
        repo = app.rights.getRepositories();

    /**
     * sdadadad
     *
     * @roles Admin, Guest
     * @description wayne
     */
    pub.log = function (callback) {
        app.logging.syslog.debug('new auth.log() implementation');

        repo.users.getAll(callback);
    };

    return pub;
};