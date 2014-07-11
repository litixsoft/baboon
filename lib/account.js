'use strict';

/**
 * The account module.
 *
 * @return {Object} An object with methods for account handling.
 */
module.exports = function (config, logging) {
    var userRepo = require('./repositories')(config.rights.database).users;
    var AccountError = require('./errors').AccountError;
    var ValidationError = require('./errors').ValidationError;
    var crypto = require('./crypto')();
    var rights = require('./rights')(config, logging);
    var mail = require('./mail')(config.mail);
    var path = require('path');
    var val = require('lx-valid');
    var pub = {};

    var createUser = function (user, callback) {
        userRepo.validate(user, {}, function (error, result) {
            if (error) {
                callback(new AccountError('Could not create user!'));
                return;
            }

            if (result.valid) {
                crypto.hashWithRandomSalt(user.password, function (error, result) {
                    user.password = result.password;
                    user.salt = result.salt;

                    userRepo.createUser(user, function (error, userResult) {
                        if (error) {
                            logging.syslog.error('%s! createUser: %j', error.toString(), user);
                            callback(new AccountError('Could not create user!'));
                            return;
                        }

                        rights.addRoleToUser(user, 'User', function (error) {
                            if (error) {
                                logging.syslog.error('%s! addRoleToUser for role "User": %j', error.toString(), user);
                                callback(new AccountError('Could not add user to role!'));
                                return;
                            }

                            rights.addRoleToUser(user, 'Guest', function (error) {
                                if (error) {
                                    logging.syslog.error('%s! addRoleToUser for role "Guest": %j', error.toString(), user);
                                    callback(new AccountError('Could not add user to role!'));
                                    return;
                                }

                                callback(error, userResult);
                            });
                        });
                    });
                });
            }
            else {
                callback(new ValidationError(result.errors));
            }
        });
    };

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

    var resetPassword = function (data, callback) {
        userRepo.findOne({ email: data.email, name: data.name }, { fields: ['_id', 'password', 'salt'] }, function (error, userResult) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error.toString(), data);
                callback(new AccountError('Could not get username.', 500));
                return;
            }
            if (!userResult) {
                logging.syslog.error('user not found: %j', data);
                callback(new AccountError('User not found.', 404));
                return;
            }

            crypto.randomString(6, function (error, randomString) {
                crypto.hashWithRandomSalt(randomString, function (error, result) {
                    userRepo.update({ _id: userResult._id }, { $set: { password: result.password, salt: result.salt } }, function (error) {
                        callback(error, randomString);
                    });
                });
            });
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
     * @param {Object} data The email object to find the username.
     * @param {Object} request The request object.
     * @param {function} callback The callback function.
     */
    pub.forgotUsername = function (data, request, callback) {
        if (!data || !data.email) {
            callback(new AccountError('Email is required.'));
            return;
        }

        var result = val.formats.email(data.email);
        if (!result.valid) {
            result.errors[0].property = 'email';
            callback(new ValidationError(result.errors));
            return;
        }

        getUsername(data.email, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            var message = { from: config.mail.senderAddress, to: data.email, subject: 'Ihr Benutzername' };
            var replaceValues = [
                { key: '{USERNAME}', value: result.name }
            ];

            var file = 'username';
            if (data.language) {
                file += '.' + data.language.toLowerCase();
            }

            mail.sendMailFromTemplate(message, path.join('username', file + '.html'), path.join('username', file + '.txt'), replaceValues, function (error) {
                if (error) {
                    logging.syslog.error('%s! sendMailFromTemplate in account.forgotUsername: %j', error.toString(), data.email);
                    callback(new AccountError('Could not send mail.'));
                    return;
                }

                callback(error, { success: true });
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

        crypto.randomBytes(48, function (error, buffer) {
            var token = buffer.toString('hex');
            data.token = token;

            createUser(data, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                var url = getBaseUrl() + '/account/activate/' + token;
                var message = { from: config.mail.senderAddress, to: data.email, subject: 'Registrierung' };
                var file = 'register';

                if (data.language) {
                    file += '.' + data.language.toLowerCase();
                    url += '/?lang=' + data.language;
                }

                var replaceValues = [
                    { key: '{NAME}', value: result.name },
                    { key: '{DISPLAYNAME}', value: result.display_name },
                    { key: '{EMAIL}', value: result.email },
                    { key: '{URL}', value: url }
                ];

                mail.sendMailFromTemplate(message, path.join('register', file + '.html'), path.join('register', file + '.txt'), replaceValues, function (error) {
                    if (error) {
                        logging.syslog.error('%s! sendMailFromTemplate in account.register: %j', error.toString(), data.email);
                        callback(new AccountError('Could not send mail.'));
                        return;
                    }

                    callback(error, { success: true });
                });
            });
        });
    };

    pub.resetPassword = function (data, request, callback) {
        if (!data || !data.email || !data.name) {
            callback(new AccountError('Email and name are required.'));
            return;
        }

        var result = val.formats.email(data.email);
        if (!result.valid) {
            result.errors[0].property = 'email';
            callback(new ValidationError(result.errors));
            return;
        }

        resetPassword(data, function (error, result) {
            if (error) {
                callback(error);
                return;
            }

            var message = { from: config.mail.senderAddress, to: data.email, subject: 'Ihr neues Passwort' };
            var replaceValues = [
                { key: '{PASSWORD}', value: result }
            ];

            var file = 'password';
            if (data.language) {
                file += '.' + data.language.toLowerCase();
            }

            mail.sendMailFromTemplate(message, path.join('password', file + '.html'), path.join('password', file + '.txt'), replaceValues, function (error) {
                if (error) {
                    logging.syslog.error('%s! sendMailFromTemplate in account.resetPassword: %j', error.toString(), data);
                    callback(new AccountError('Could not send mail.'));
                    return;
                }

                callback(error, { success: true });
            });
        });
    };

    /**
     * Changes the password of the current user.
     *
     * @param {!Object} data The password data.
     * @param {!String} data.current_password The current password of the user.
     * @param {!String} data.new_password The new password.
     * @param {!String} data.new_password_confirmed The new password confirmed.
     * @param {!Object} request The request object.
     * @param {function(?Object=, ?Object=)} callback The callback function.
     */
    pub.changePassword = function (data, request, callback) {
        if (!data || !data.current_password || !data.new_password || !data.new_password_confirmed) {
            return callback(new AccountError('All password fields are required.'));
        }

        if (data.new_password !== data.new_password_confirmed) {
            return callback(new AccountError('Confirmed password does not equals the new password'));
        }

        userRepo.findOneById(request.session.user._id, { fields: ['_id', 'password', 'salt'] }, function (error, user) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error.toString(), data);
                return callback(new AccountError('Cannot get user.', 500));
            }

            if (!user) {
                logging.syslog.error('user not found: %j', data);
                return callback(new AccountError('User not found.', 404));
            }

            // check password
            crypto.compare(data.current_password, user.password, user.salt, function (error, result) {
                if (!error && result) {
                    if (result.is_equal) {
                        crypto.hashWithRandomSalt(data.new_password, function (error, result) {
                            if (error) {
                                return callback(new AccountError('Change password failed, unknown error in crypto', 500));
                            }

                            if (result) {
                                userRepo.update({_id: user._id}, {$set: {password: result.password, salt: result.salt}}, function (error, result) {
                                    if (error) {
                                        callback(new AccountError('Change password failed, unknown error in updating user', 500));
                                    } else {
                                        callback(null, result);
                                    }
                                });
                            }
                        });
                    } else {
                        callback(new AccountError('Change password failed, current password is wrong', 403));
                    }
                } else {
                    callback(error || new AccountError('Change password failed, unknown error in compare password', 500));
                }
            });
        });
    };

    return pub;
};
