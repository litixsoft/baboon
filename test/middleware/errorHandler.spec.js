'use strict';

describe('Middleware/ErrorHandler', function () {

    var path = require('path');
    var rootPath = path.resolve(__dirname, '../../');
    var errorHandler = require(path.resolve(rootPath, 'lib', 'middleware', 'errorHandler'));
    var appMock = require(path.resolve(rootPath, 'test', 'mocks', 'appMock'));
    var NavigationError = require(path.resolve(rootPath, 'lib', 'errors')).NavigationError;
    var ConfigError = require(path.resolve(rootPath, 'lib', 'errors')).ConfigError;
    var mock, sut;

    beforeEach(function() {
        spyOn(console, 'log');
        mock = appMock();
        sut = errorHandler(mock.logging.syslog);
    });

    it('should be defined errorHandler', function() {
        expect(sut).toBeDefined();
        expect(sut.errorHandler).toBeDefined();
    });

    it('should be set status 500 when error status undefined ', function() {
        var res = mock.res;
        var error = new NavigationError(400, 'errorHandlerTest', 'unit test error');
        delete error.status;
        sut.errorHandler(error, {}, res);

        var data = JSON.parse(res.data);

        expect(res.statusCode).toBe(500);

        expect(data.error.name).toBe('NavigationError');
        expect(data.error.resource).toBe('errorHandlerTest');
        expect(data.error.statusCode).toBe(500);
        expect(data.error.message).toBe('unit test error');
    });

    it('should be set status 500 when error status less than 400 ', function() {
        var res = mock.res;
        var error = new NavigationError(399, 'errorHandlerTest', 'unit test error');
        sut.errorHandler(error, {}, res);

        var data = JSON.parse(res.data);

        expect(res.statusCode).toBe(500);

        expect(data.error.name).toBe('NavigationError');
        expect(data.error.resource).toBe('errorHandlerTest');
        expect(data.error.statusCode).toBe(500);
        expect(data.error.message).toBe('unit test error');
    });
    it('should be return navigation error', function() {
        var res = mock.res;
        var error = new NavigationError(400, 'errorHandlerTest', 'unit test error');
        sut.errorHandler(error, {}, res);

        var data = JSON.parse(res.data);

        expect(res.statusCode).toBe(400);

        expect(data.error.name).toBe('NavigationError');
        expect(data.error.resource).toBe('errorHandlerTest');
        expect(data.error.statusCode).toBe(400);
        expect(data.error.message).toBe('unit test error');
    });

    it('should be when unknown error call next() function', function(done) {
        var res = mock.res;
        var error = new ConfigError('ConfigTestError');
        var isNextCall = false;

        sut.errorHandler(error, {}, res, function() {
            isNextCall = true;
            done();
        });

        expect(isNextCall).toBe(true);
    });
});
