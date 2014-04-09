'use strict';

describe('Errors', function () {

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

    it('should throw an TransportError with message', function() {
        var TransportError = errors.TransportError;
        var error = new TransportError(400, 'unitTest', 'TransportTestError');

        expect(error.name).toBe('TransportError');
        expect(error.message).toBe('TransportTestError');
        expect(error.status).toBe(400);
        expect(error.resource).toBe('unitTest');
        expect(error instanceof TransportError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an TransportError without message', function() {
        var TransportError = errors.TransportError;
        var error = new TransportError();

        expect(error.name).toBe('TransportError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
        expect(error.resource).toBe('undefined');
    });

    it('should throw an NavigationError with message, resource and status', function() {
        var NavigationError = errors.NavigationError;
        var error = new NavigationError(400, 'unitTest', 'NavigationTestError');

        expect(error.name).toBe('NavigationError');
        expect(error.message).toBe('NavigationTestError');
        expect(error.status).toBe(400);
        expect(error.resource).toBe('unitTest');
        expect(error instanceof NavigationError).toBe(true);
        expect(error instanceof Error).toBe(true);

    });
    it('should throw an NavigationError without parameters', function() {
        var NavigationError = errors.NavigationError;
        var error = new NavigationError();

        expect(error.name).toBe('NavigationError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
        expect(error.resource).toBe('undefined');
        expect(error instanceof NavigationError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an MailError with message', function() {
        var MailError = errors.MailError;
        var error = new MailError('MailTestError');

        expect(error.message).toBe('MailTestError');
        expect(error instanceof MailError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an MailError without message', function() {
        var MailError = errors.MailError;
        var error = new MailError();

        expect(error.message).toBe('');
        expect(error instanceof MailError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an SessionError with message', function() {
        var SessionError = errors.SessionError;
        var error = new SessionError('SessionTestError');

        expect(error.message).toBe('SessionTestError');
        expect(error instanceof SessionError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an SessionError without message', function() {
        var SessionError = errors.SessionError;
        var error = new SessionError();

        expect(error.message).toBe('');
        expect(error instanceof SessionError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an RightsError with message', function() {
        var RightsError = errors.RightsError;
        var error = new RightsError('RightsTestError');

        expect(error.message).toBe('RightsTestError');
        expect(error instanceof RightsError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an RightsError without message', function() {
        var RightsError = errors.RightsError;
        var error = new RightsError();

        expect(error.message).toBe('');
        expect(error instanceof RightsError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});