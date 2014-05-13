'use strict';

/**
 * The account module.
 *
 * @return {Object} An object with methods for account handling.
 */
module.exports = function (config, logging) {
    var userRepo = require('./repositories')(config.rights.database).users;
    var AccountError = require('./errors').AccountError;
    var mail = require('./mail')(config.mail);
    var pub = {};

    pub.register = function (user, callback) {
        userRepo.validate(user, {}, function (error, result) {
            if (error) {
                callback(new AccountError('Could not create user!'));
                return;
            }

            if (result.valid) {
                userRepo.createUser(user, function (error, result) {
                    callback(error, result);

                    // zeit token für bestätigungslink generieren? wird vom admin konfiguriert!
                    // email senden?
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

            mail.sendMailFromTemplate(message, 'username.html', 'username.txt', [
                    { key: '{USERNAME}', value: result.name }
                ],
                function (error, result) {
                    callback(error, result);
                });
        });
    };

    return pub;
};
