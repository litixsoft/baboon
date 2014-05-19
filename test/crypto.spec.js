'use strict';

/* global describe, it, expect */
describe('Crypto', function () {
    var path = require('path'),
        rootPath = path.resolve(__dirname, '..'),
        crypto = require(path.resolve(rootPath, 'lib', 'crypto'))();

    it('should be initialized correctly', function () {
        expect(typeof crypto.hashWithRandomSalt).toBe('function');
    });

    describe('has a function hashWithRandomSalt which', function () {
        it('should return an object with valid data', function(done) {
            var password = 'password_to_hash';

            crypto.hashWithRandomSalt(password, function(error, result) {
                expect(error).not.toBeDefined();
                expect(result).not.toBe(null);
                expect(result.password).toBeDefined();
                expect(result.salt).toBeDefined();
                expect(result.password.length).toBeDefined(256);
                expect(result.salt.length).toBe(128);

                done();
            });
        });
    });

    describe('has a function randomBytes which', function () {
        it('should return a buffer with valid data', function(done) {
            crypto.randomBytes(48, function(error, buffer) {
                expect(error).toBe(null);
                expect(buffer).toBeDefined();
                expect(buffer.length).toBe(48);

                done();
            });
        });
    });

    describe('has a function compare which', function () {
        it('should compare a string with a salt and a hash and return true', function(done) {
            var hash = '41f3b174d3025c4cb3cb2b8632f65bad7a9f1eb2c8e5b7c9c1340be050731162978dac8e777e0b8c23e3b60ef78052e30f0f4bf85297d016b4627f41dbdd95a101ccda2631a857eb051059a468717bb35f264b3d8b2a77893b78e99cf049c8b83a6ab3c7c0d0ae888c954d2cff4e4992560ae4da28df78fa8cf22fd7920e967d';
            var salt = '9d6f4d7c790dfcdbf203b3beb562f0fabdf0276cde30fc5f947d85e14bed07480db833b2087db81bf5e7d0866ee35ff0b7e82b968bb1cd899ba7656b42755411';

            crypto.compare('password_to_hash', hash, salt, function(error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.is_equal).toBeTruthy();

                done();
            });
        });

        it('should compare a string with a salt and a hash and return false', function(done) {
            var hash = '_1f3b174d3025c4cb3cb2b8632f65bad7a9f1eb2c8e5b7c9c1340be050731162978dac8e777e0b8c23e3b60ef78052e30f0f4bf85297d016b4627f41dbdd95a101ccda2631a857eb051059a468717bb35f264b3d8b2a77893b78e99cf049c8b83a6ab3c7c0d0ae888c954d2cff4e4992560ae4da28df78fa8cf22fd7920e967d';
            var salt = '9d6f4d7c790dfcdbf203b3beb562f0fabdf0276cde30fc5f947d85e14bed07480db833b2087db81bf5e7d0866ee35ff0b7e82b968bb1cd899ba7656b42755411';

            crypto.compare('password_to_hash', hash, salt, function(error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.is_equal).toBeFalsy();

                done();
            });
        });

        it('should compare a string with a salt and a hash and return false', function(done) {
            var hash = '41f3b174d3025c4cb3cb2b8632f65bad7a9f1eb2c8e5b7c9c1340be050731162978dac8e777e0b8c23e3b60ef78052e30f0f4bf85297d016b4627f41dbdd95a101ccda2631a857eb051059a468717bb35f264b3d8b2a77893b78e99cf049c8b83a6ab3c7c0d0ae888c954d2cff4e4992560ae4da28df78fa8cf22fd7920e967d';
            var salt = '9d6f4d7c790dfcdbf203b3beb562f0fabdf0276cde30fc5f947d85e14bed07480db833b2087db81bf5e7d0866ee35ff0b7e82b968bb1cd899ba7656b42755411';

            crypto.compare('wrong_password_to_hash', hash, salt, function(error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.is_equal).toBeFalsy();

                done();
            });
        });
    });
});