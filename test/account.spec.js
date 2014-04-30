'use strict';

/* global describe, it, expect, beforeEach */
describe('Account', function () {
    var path = require('path'),
        rootPath = path.resolve(__dirname, '..'),
        config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
        account = require(path.resolve(rootPath, 'lib', 'account'))(config),
        userRepo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database).users;

    beforeEach(function (done) {
        userRepo.remove({name: 'JohnDoe_accounttest'}, done);
    });

    it('should be initialized correctly', function () {
        expect(typeof account.register).toBe('function');
        expect(typeof account.login).toBe('function');
         /*expect(typeof sut.resetPassword).toBe('function');
        expect(typeof sut.forgotUsername).toBe('function');*/
    });

    describe('has a function register which', function () {
        it('should create an user', function(done) {
            account.register({name: 'JohnDoe_accounttest', displayName: 'John Doe', email: 'john@doe.com'}, function(error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                expect(result._id).toBeDefined();

                done();
            });
        });

        it('should return an error with missing required fields', function(done) {
            account.register({name: 'JohnDoe_accounttest'}, function(error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.validation.length).toBe(1);
                expect(error.validation[0].attribute).toBe('required');
                expect(error.validation[0].property).toBe('email');

                done();
            });
        });

        it('should return an error with duplicate user name', function(done) {
            account.register({name: 'JohnDoe_accounttest', displayName: 'John Doe', email: 'john@doe.com'}, function(error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();

                account.register({name: 'JohnDoe_accounttest', displayName: 'John Doe', email: 'john@doe.com'}, function(error, result) {
                    expect(error).toBeDefined();
                    expect(result).not.toBeDefined();
                    expect(error.validation.length).toBe(1);
                    expect(error.validation[0].attribute).toBe('checkName');

                    done();
                });
            });
        });
    });

    describe('has a function login which', function () {
        it('should return an error with missing data', function(done) {
            account.login(null, function(error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username and password required.');

                done();
            });
        });

        it('should return an error with empty data', function(done) {
            account.login({}, function(error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username and password required.');

                done();
            });
        });

        it('should return an error with missing username', function(done) {
            account.login({password: '123'}, function(error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username and password required.');

                done();
            });
        });

        it('should return an error with missing password', function(done) {
            account.login({username: 'user'}, function(error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();
                expect(error.message).toBe('Username and password required.');

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
});