'use strict';

/**
 * The account module.
 *
 * @return {Object} An object with methods for account handling.
 */
module.exports = function (config, logging) {
    var userRepo = require('./repositories')(config.rights.database).users;
    var AccountError = require('./errors').AccountError;
    var crypto = require('./crypto')();
    var mail = require('./mail')(config.mail);
    var pub = {};

    var createUser = function (user, callback) {
        userRepo.validate(user, {}, function (error, result) {
            if (error) {
                callback(new AccountError('Could not create user!'));
                return;
            }

            if (result.valid) {
                crypto.hashWithRandomSalt(user.password, function (error, result) {
                    user.password = result.hash;
                    user.salt = result.salt;

                    userRepo.createUser(user, function (error, result) {
                        if (error) {
                            callback(new AccountError('Could not create user!'));
                            return;
                        }
                        callback(error, result);
                    });
                });
            }
            else {
                callback({validation: result.errors});
            }
        });
    };

    /*     pub.resetPassword = function(user, callback) {
     callback();
     };*/

    /**
     * Gets the username for the given email.
     *
     * @param email The email to find the username.
     * @param callback The callback function.
     */
    var getUsername = function (email, callback) {
        userRepo.findOne({email: email}, {fields: ['name']}, function (error, result) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error.toString(), email);
                callback(new AccountError('Could not get username.', 500));
                return;
            }

            if (!result) {
                callback(new AccountError('Username not found.', 404));
                return;
            }

            callback(null, result);
        });
    };

    /**
     * Gets the base url.
     *
     */
    var getBaseUrl = function () {
        var url = config.protocol + '://' + config.host;

        if (config.port !== 80) {
            url += ':' + config.port;
        }

        return url;
    };

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
            callback(new AccountError('Username or password do not match', 403));
        }
    };

    // API for account

    /**
     * Gets the username for the given email and sends the username to the give email.
     *
     * @param email The email to find the username.
     * @param request The request object.
     * @param callback The callback function.
     */
    pub.forgotUsername = function (email, request, callback) {
        if (!email) {
            callback(new AccountError('Email is required.'));
            return;
        }

        getUsername(email, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            var message = { from: config.mail.senderAddress, to: email, subject: 'Ihr Benutzername' };
            var replaceValues = [
                { key: '{USERNAME}', value: result.name }
            ];

            mail.sendMailFromTemplate(message, 'username.html', 'username.txt', replaceValues, function (error, result) {
                callback(error, result);
            });
        });
    };

    /**
     * Creates an user with the given data. The given password will be hashed.
     *
     * @param data The user which should create.
     * @param request The request object.
     * @param callback The callback function.
     */
    pub.register = function (data, request, callback) {
        if (!data) {
            callback(new AccountError('User is required.'));
            return;
        }
        data.name = (data.name || '').trim();
        data.password = (data.password || '').trim();
        data.displayname = (data.displayname || '').trim();

        createUser(data, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            crypto.randomBytes(48, function (error, buffer) {
                var token = buffer.toString('hex');
                var url = getBaseUrl() + '/activate/' + token;
                var message = { from: config.mail.senderAddress, to: data.email, subject: 'Registrierung' };
                var replaceValues = [
                    { key: '{NAME}', value: result.name },
                    { key: '{DISPLAYNAME}', value: result.display_name },
                    { key: '{EMAIL}', value: result.email },
                    { key: '{URL}', value: url }
                ];

                mail.sendMailFromTemplate(message, 'register.html', 'register.txt', replaceValues, function (error, result) {
                    callback(error, result);
                });
            });
        });
    };

    /**
     * Login
     * Login with username and password
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.login = function (data, request, callback) {

        if (typeof data.user !== 'object') {
            return callback(new AccountError('Parameter user is required and must be a object type!', 400));
        }

        if (typeof data.user.username !== 'string') {
            return callback(new AccountError('Parameter username is required and must be a string type!', 400));
        }

        if (typeof data.user.password !== 'string') {
            return callback(new AccountError('Parameter password is required and must be a string type!', 400));
        }

        return authenticate(data.user.username, data.user.password, callback);
    };

    return pub;
};
