/* global describe, it, expect*/
describe('Errors', function () {
    'use strict';

    var path = require('path');
    var errors = require(path.resolve(__dirname, '../', 'lib', 'errors'));


    it('should throw an ConfigError with message', function() {
        var ConfigError = errors.ConfigError;
        var error = new ConfigError('ConfigTestError');

        expect(error.message).toBe('ConfigTestError');
        expect(error instanceof ConfigError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an ConfigError without message', function() {
        var ConfigError = errors.ConfigError;
        var error = new ConfigError();

        expect(error.message).toBe('');
        expect(error instanceof ConfigError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an LogError with message', function() {
        var LogError = errors.LogError;
        var error = new LogError('LogTestError');

        expect(error.message).toBe('LogTestError');
        expect(error instanceof LogError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an LogError without message', function() {
        var LogError = errors.LogError;
        var error = new LogError();

        expect(error.message).toBe('');
        expect(error instanceof LogError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});