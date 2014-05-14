'use strict';

/* global describe, it, expect, beforeEach, spyOn */
describe('Account', function () {
    var path = require('path'),
        fs = require('fs'),
        rootPath = path.resolve(__dirname, '..'),
        appMock = require('./mocks/appMock')(),
        config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
        account = require(path.resolve(rootPath, 'lib', 'account'))(config, appMock.logging),
        userRepo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database).users,
        AccountError = require(path.resolve(__dirname, '../', 'lib', 'errors')).AccountError;

    beforeEach(function () {
        spyOn(appMock.logging.syslog, 'info');
    });

    it('should be initialized correctly', function () {
        expect(typeof account.register).toBe('function');
        expect(typeof account.forgotUsername).toBe('function');
        /*expect(typeof sut.resetPassword).toBe('function');*/
    });

    describe('has a function register which', function () {
        var request = { };
        beforeEach(function (done) {
            userRepo.remove({name: 'JohnDoe_accounttest'}, done);
        });

        it('should create an user', function (done) {
            account.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com'}, request, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                //expect(result._id).toBeDefined();

                done();
            });
        });

        it('should return an error with missing required fields', function (done) {
            account.register({name: 'JohnDoe_accounttest'}, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.validation.length).toBe(3);
                expect(error.validation[0].attribute).toBe('required');
                expect(error.validation[0].property).toBe('email');

                done();
            });
        });

        it('should return an error with duplicate user name', function (done) {
            account.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com'}, request, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();

                account.register({name: 'JohnDoe_accounttest', password: 'test', confirmed_password: 'test', display_name: 'John Doe', email: 'john@doe.com'}, request, function (error, result) {
                    expect(error).toBeDefined();
                    expect(result).not.toBeDefined();
                    expect(error.validation.length).toBe(1);
                    expect(error.validation[0].attribute).toBe('checkName');

                    done();
                });
            });
        });
    });

    /*
     describe('has a function login which', function () {
     it('should return an error with missing data', function(done) {
     account.login(null, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password are required.');

     done();
     });
     });

     it('should return an error with empty data', function(done) {
     account.login({}, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password are required.');

     done();
     });
     });

     it('should return an error with missing username', function(done) {
     account.login({password: '123'}, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password are required.');

     done();
     });
     });

     it('should return an error with missing password', function(done) {
     account.login({username: 'user'}, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password are required.');

     done();
     });
     });

     it('should return an error with wrong type of username', function(done) {
     account.login({username: 1, password: '123'}, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password must be of type string.');

     done();
     });
     });

     it('should return an error with wrong type of password', function(done) {
     account.login({username: 'user', password: 1}, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username and password must be of type string.');

     done();
     });
     });
     });
     */

    /*describe('has a getUsername login which', function () {
     var user = { name: 'wayne', hash: 'hash', salt: 'salt', email: 'test@test.com' };

     beforeEach(function (done) {
     userRepo.insert(user, function() { done(); });
     });

     afterEach(function(done) {
     userRepo.remove({name: user.name}, function () {done();});
     });

     it('should return an error with missing data', function(done) {
     account.getUsername(null, function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Email is required.');

     done();
     });
     });

     it('should return an error if user not found', function(done) {
     account.getUsername('notfound@test.com', function(error, result) {
     expect(error).toBeDefined();
     expect(result).not.toBeDefined();
     expect(error.message).toBe('Username not found.');
     expect(error instanceof AccountError).toBeTruthy();

     done();
     });
     });

     it('should return a valid username', function(done) {
     account.getUsername('test@test.com', function(error, result) {
     expect(error).toBeNull();
     expect(result).toBeDefined();
     expect(result.name).toBe('wayne');

     done();
     });
     });
     });*/

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
            account.forgotUsername({ email: 'test@test.com' }, request, function (error, result) {
                expect(error).toBe(null);
                expect(result).toBeDefined();
                expect(result.path).toBeDefined();
                var exists = fs.existsSync(result.path);
                expect(exists).toBeTruthy();

                done();
            });
        });

        it('should return an error with missing data', function (done) {
            account.forgotUsername(null, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Email is required.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });

        it('should return an error', function (done) {
            account.forgotUsername({ email: { $set: {_id: 1 } } }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(error.message).toBe('Could not get username.');
                expect(result).not.toBeDefined();
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });

        it('should return an error if user not found', function (done) {
            account.forgotUsername({ email: 'notfound@test.com' }, request, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username not found.');
                expect(error instanceof AccountError).toBeTruthy();

                done();
            });
        });
    });

    afterEach(function (done) {
        fs.readdirSync(config.mail.directory).forEach(function (file) {
            var curPath = path.resolve(config.mail.directory, file);
            fs.unlinkSync(curPath);
        });

        done();
    });
});