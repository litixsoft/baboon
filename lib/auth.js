'use strict';

var LoginError = require('./errors').LoginError;

module.exports = function () {

    var pub = {};

    /**
     * Authenticate
     * Helper for login
     *
     * @param username
     * @param password
     * @param callback
     */
    var authenticate = function (username, password, callback) {

        var testUser = 'admin';
        var testPassword = 'a';

        if (username === testUser && password === testPassword) {
            callback(null, true);
        }
        else {
            callback(new LoginError('Username or password do not match', 403));
        }
    };

    // Transport api

    /**
     * Login
     * Login with username and password
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.login = function(data, request, callback) {

        if (typeof data.user !== 'object') {
            return callback(new LoginError('Parameter user is required and must be a object type!', 400));
        }

        if (typeof data.user.username !== 'string') {
            return callback(new LoginError('Parameter username is required and must be a string type!', 400));
        }

        if (typeof data.user.password !== 'string') {
            return callback(new LoginError('Parameter password is required and must be a string type!', 400));
        }

        return authenticate(data.user.username, data.user.password, callback);
    };

    return pub;
};