'use strict';

module.exports = function (app) {
    var pub = {},
        repo = app.rights.getRepositories();

    /**
     * Register a new user in database
     *
     * @roles Admin, Guest
     * @description Register a new user
     */
    pub.registerUser = function (data, req, callback) {
        app.logging.syslog.debug('new registerUser implementation');
        repo.users.getAll(callback);
    };

    return pub;
};