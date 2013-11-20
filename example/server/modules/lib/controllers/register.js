'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (app) {
    var pub = {},
        db = lxDb.GetDb(app.config.mongo.rights, ['users']),
        repo = require('../repositories/usersRepository')(db.users);

    /**
     * Register a new user in database
     *
     * @roles Admin, Guest
     * @description Register a new user
     */
    pub.registerUser = function (data, req, callback) {
        app.logging.syslog.debug('new registerUser implementation');
        repo.getAll(function(error, result) {

            var response = {};

            if (error) {
                response = error;
            }
            else {
                response = result;
            }

            var echoTest = {
                header: 'echoTest from server registerUser',
                receivedFromClient: data,
                sentFromServer: response
            };

            callback(null, echoTest);
        });
    };

    /**
     * Create a new password for user
     *
     * @roles Admin, Guest
     * @description Create a new password
     */
    pub.createNewPassword = function (data, req, callback) {
        app.logging.syslog.debug('new create new Password implementation');
        repo.getAll(function(error, result) {

            var response = {};

            if (error) {
                response = error;
            }
            else {
                response = result;
            }

            var echoTest = {
                header: 'echoTest from server createNewPassword',
                receivedFromClient: data,
                sentFromServer: response
            };

            callback(null, echoTest);
        });
    };

    return pub;
};