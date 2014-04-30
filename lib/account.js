'use strict';

/**
 * The account module.
 *
 * @return {Object} An object with methods for account handling.
 */
module.exports = function (config) {
    var userRepo = require('./repositories')(config.rights.database).users;

    var pub = {};

    pub.register = function(user, callback) {
        userRepo.validate(user, {}, function (error, result) {
            if (error) {
                callback(new Error('Could not create user!'));
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

   pub.login = function(data, callback) {
       if (!data || !data.username || !data.password) {
           callback(new Error('Username and password required.'));
           return;
       }

       if (typeof data.username !== 'string' || typeof data.password !== 'string') {
           callback(new Error('Username and password must be of type string.'));
           return;
       }

       // wenn von admin angelegt -> passwort ändern?

       callback();
    };

 /*     pub.resetPassword = function(user, callback) {
        callback();
    };

    pub.forgotUsername = function(email, callback) {
        callback();
    };*/

    return pub;
};
