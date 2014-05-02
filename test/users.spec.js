'use strict';

/*  global describe, it, expect, beforeEach, spyOn */
describe('User', function () {
    var path = require('path'),
        rootPath = path.resolve(__dirname, '..'),
        appMock = require('./mocks/appMock')(),
        config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
        sut = require(path.resolve(rootPath, 'lib', 'users'))(config, appMock.logging),
        repo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database);

    beforeEach(function () {
        spyOn(appMock.logging.syslog, 'info');
    });

    it('should throw an Error when not given params', function () {
        var func = function () {
            return require(path.resolve(rootPath, 'lib', 'users'))();
        };
        expect(func).toThrow(new TypeError('Parameter config is required and must be of type object.'));
    });

    it('should throw an Error when not given param config.rights', function () {
        var func = function () {
            return require(path.resolve(rootPath, 'lib', 'users'))({}, {});
        };
        expect(func).toThrow(new TypeError('Parameter config.rights is required and must be of type object.'));
    });

    it('should throw an Error when not given param "logging"', function () {
        var func = function () {
            return require(path.resolve(rootPath, 'lib', 'users'))(config);
        };
        expect(func).toThrow(new TypeError('Parameter logging is required and must be of type object.'));
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.getUserForLogin).toBe('function');
    });

    describe('has a function getUserForLogin which', function () {
        var user = { name: 'wayne', hash: 'hash', salt: 'salt' };

        beforeEach(function (done) {
            repo.users.insert(user, function() { done(); });
        });

        afterEach(function(done) {
            repo.users.remove({name: user.name}, function () {done();});
        });

        it('should return the user with minimal data', function (done) {
            sut.getUserForLogin(user.name, function (error, result) {
                expect(error).toBeNull();
                expect(result).toEqual(user);

                done();
            });
        });

        it('should return an mongodb error', function (done) {
            sut.getUserForLogin({ $set: {_id: 1 }}, function (error, result) {
                expect(error).toBeDefined();
                expect(error.name).toBe('MongoError');
                expect(error.message).toBe('invalid operator: $set');
                expect(result).not.toBeDefined();

                done();
            });
        });
    });
});