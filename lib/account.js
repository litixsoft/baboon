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

//    pub.resetPassword = function(user, callback) {
//      callback();
//    };

    /**
     * Gets the username for the given email.
     *
     * @param {string} email The email to find the username.
     * @param {function} callback The callback function.
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

    // API for account
    /**
     * Gets the username for the given email and sends the username to the give email.
     *
     * @param {string} email The email to find the username.
     * @param {Object} request The request object.
     * @param {function} callback The callback function.
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
                    { key: '{NAME}', value: result.name }, { key: '{DISPLAYNAME}', value: result.display_name },
                    { key: '{EMAIL}', value: result.email }, { key: '{URL}', value: url }];

                mail.sendMailFromTemplate(message, 'register.html', 'register.txt', replaceValues, function(error, result) {
                    callback(error, result);
                });
            });
        });
    };

    return pub;
};
