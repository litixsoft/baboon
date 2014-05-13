'use strict';

module.exports = function () {
    var crypto = require('crypto');
    var pub = {};
    var saltLen = 64;
    var iterations = 1000;
    var keyLen = 128;

    pub.hashWithRandomSalt = function (password, callback) {
        var data = {};
        crypto.randomBytes(saltLen, function (error, buffer) {
            if (error) {
                callback(error);
                return;
            }

            data.salt = buffer.toString('hex');

            crypto.pbkdf2(password, data.salt, iterations, keyLen, function (error, encodedPassword) {
                if (error) {
                    callback(error);
                    return;
                }

                data.hash = encodedPassword.toString('hex');
                callback(error, data);
            });
        });
    };

    pub.randomBytes = function (length, callback) {
        crypto.randomBytes(length, function (error, buffer) {
            if (error) {
                callback(error);
                return;
            }

            callback(error, buffer);
        });
    };

    pub.compare = function (plain, hash, salt, callback) {
        crypto.pbkdf2(plain, salt, iterations, keyLen, function (error, encodedPassword) {
            if (error) {
                callback(error);
                return;
            }

            var hashToCompare = encodedPassword.toString('hex');

            callback(null, { is_equal: hash === hashToCompare });
        });
    };

    return pub;
};
