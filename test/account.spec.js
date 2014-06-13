'use strict';

/* global describe, it, expect, beforeEach, spyOn */
describe('Account', function () {
    var path = require('path'),
        fs = require('fs'),
        rootPath = path.resolve(__dirname, '..'),
        appMock = require('./mocks/appMock')(),
        config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
        emlDir = path.resolve(config.mail.directory),
        sut = null,
        userRepo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database).users,
        rolesRepo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database).roles,
        AccountError = require(path.resolve(__dirname, '../', 'lib', 'errors')).AccountError;

    beforeEach(function () {
        if (!fs.existsSync(emlDir)) {
            require('grunt').file.mkdir(emlDir);
        }

        if (sut === null) {
            sut = require(path.resolve(rootPath, 'lib', 'account'))(config, appMock.logging);
        }

        spyOn(appMock.logging.syslog, 'info');
        spyOn(appMock.logging.syslog, 'error');
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.register).toBe('function');
        expect(typeof sut.forgotUsername).toBe('function');
        expect(typeof sut.resetPassword).toBe('function');
    });

    describe('has a function register which', function () {
        var request = { };
        beforeEach(function (done) {
            userRepo.remove({name: 'JohnDoe_accounttest'}, function(){
                rolesRepo.remove({name: 'User', key: 'AccountTest'}, function(){
                    rolesRepo.insert({name: 'User', key: 'AccountTest'}, function() {
                        rolesRepo.remove({name: 'Guest', key: 'AccountTest'}, function(){
                            rolesRepo.insert({name: 'Guest', key: 'AccountTest'}, done);
                        });
                    });
                });
            });
        });

        it('should create an user', function (done) {
            sut.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com'}, request, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should create an user', function (done) {
            sut.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com', language: 'en-us'}, request, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should return an error with missing data', function (done) {
            sut.register(null, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('User is required.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });

        it('should return an error with missing required fields', function (done) {
            sut.register({name: 'JohnDoe_accounttest'}, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.errors.length).toBe(1);
                expect(error.errors[0].attribute).toBe('required');
                expect(error.errors[0].property).toBe('email');

                done();
            });
        });

        it('should return an error with empty data', function (done) {
            sut.register({ name: { $set: { name: 'Test'} } }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();

                done();
            });
        });

        it('should return an error with duplicate user name', function (done) {
            sut.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com'}, request, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                sut.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john2@doe.com'}, request, function (error, result) {
                    expect(error).toBeDefined();
                    expect(result).not.toBeDefined();
                    expect(error.errors.length).toBe(1);
                    expect(error.errors[0].attribute).toBe('checkName');

                    done();
                });
            });
        });
    });

    describe('has a forgotUsername login which', function () {
        var user = { name: 'wayne', hash: 'hash', salt: 'salt', email: 'test@test.com' };
        var request = { };

        beforeEach(function (done) {
            userRepo.insert(user, function () { done(); });
        });

        afterEach(function (done) {
            userRepo.remove({name: user.name}, function () {done();});
        });

        it('should return a valid username', function (done) {
            sut.forgotUsername({ email: 'test@test.com' }, request, function (error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should return a valid username', function (done) {
            sut.forgotUsername({ email: 'test@test.com', language: 'en-us' }, request, function (error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should return an error with missing data', function (done) {
            sut.forgotUsername(null, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Email is required.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });

        it('should return an error', function (done) {
            sut.forgotUsername({ email: 'abcde' }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(error.errors).toBeDefined();
                expect(error.errors[0].message).toBe('is not a valid email');
                expect(result).not.toBeDefined();

                done();
            });
        });

        it('should return an error if user not found', function (done) {
            sut.forgotUsername({ email: 'notfound@test.com' }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username not found.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });
    });

    describe('has a resetPassword login which', function () {
        var user = { name: 'test', hash: 'hash', salt: 'salt', email: 'test@test.com' };
        var request = { };

        beforeEach(function (done) {
            userRepo.insert(user, function () { done(); });
        });

        afterEach(function (done) {
            userRepo.remove({name: user.name}, function () {done();});
        });

        it('should return reset the password', function (done) {
            sut.resetPassword({ name: 'test', email: 'test@test.com' }, request, function (error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should return reset the password', function (done) {
            sut.resetPassword({ name: 'test', email: 'test@test.com', language: 'en-us' }, request, function (error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.success).toBeTruthy();

                done();
            });
        });

        it('should return an error with missing data', function (done) {
            sut.resetPassword(null, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Email and name are required.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });

        it('should return an error', function (done) {
            sut.resetPassword({ name: 'test', email: 'abcde' }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(error.errors).toBeDefined();
                expect(error.errors[0].message).toBe('is not a valid email');
                expect(result).not.toBeDefined();

                done();
            });
        });

        it('should return an error if user not found', function (done) {
            sut.resetPassword({ name: 'test', email: 'notfound@test.com' }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error instanceof AccountError).toBeTruthy();
                expect(error.message).toBe('User not found.');
                expect(error.status).toBe(404);

                done();
            });
        });

        it('should return an error with invalid data', function (done) {
            sut.resetPassword({ email: 'test@test.com', name: { $set: { name: 'test' } } }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Could not get username.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });
    });
});