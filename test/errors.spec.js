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

    it('should throw an NavigationError with message and status', function() {
        var NavigationError = errors.NavigationError;
        var error = new NavigationError('NavigationTestError', 400);

        expect(error.name).toBe('NavigationError');
        expect(error.message).toBe('NavigationTestError');
        expect(error.status).toBe(400);
        expect(error instanceof NavigationError).toBe(true);
        expect(error instanceof Error).toBe(true);

    });
    it('should throw an NavigationError without parameters', function() {
        var NavigationError = errors.NavigationError;
        var error = new NavigationError();

        expect(error.name).toBe('NavigationError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
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

    it('should throw an SessionError with message and status', function() {
        var SessionError = errors.SessionError;
        var error = new SessionError('SessionTestError', 400);

        expect(error.name).toBe('SessionError');
        expect(error.message).toBe('SessionTestError');
        expect(error.status).toBe(400);
        expect(error instanceof SessionError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an SessionError without parameters', function() {
        var SessionError = errors.SessionError;
        var error = new SessionError();

        expect(error.name).toBe('SessionError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
        expect(error instanceof SessionError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an AuthError with message and status', function() {
        var AuthError = errors.AuthError;
        var error = new AuthError('AuthTestError', 400);

        expect(error.name).toBe('AuthError');
        expect(error.message).toBe('AuthTestError');
        expect(error.status).toBe(400);
        expect(error instanceof AuthError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an AuthError without parameters', function() {
        var AuthError = errors.AuthError;
        var error = new AuthError();

        expect(error.name).toBe('AuthError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
        expect(error instanceof AuthError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an ValidationError with errors and status', function() {
        var ValidationError = errors.ValidationError;
        var error = new ValidationError([{property:'test', error:'test', message: 'not valid'}], 401);

        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('test: not valid');
        expect(error.errors[0].property).toBe('test');
        expect(error.status).toBe(401);
        expect(error instanceof ValidationError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an ValidationError without parameters', function() {
        var ValidationError = errors.ValidationError;
        var error = new ValidationError();

        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('');
        expect(error.status).toBe(200);
        expect(error.errors.length).toBe(0);
        expect(error instanceof ValidationError).toBe(true);
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

    it('should throw an ControllerError with message, status, displayClient, controller and resource', function() {
        var ControllerError = errors.ControllerError;
        var error = new ControllerError('ControllerTestError', 400, true, 'TestController', 'TestResource');

        expect(error.name).toBe('ControllerError');
        expect(error.message).toBe('ControllerTestError');
        expect(error.status).toBe(400);
        expect(error.displayClient).toBe(true);
        expect(error.controller).toBe('TestController');
        expect(error.resource).toBe('TestResource');
        expect(error instanceof ControllerError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an ControllerError without parameters', function() {
        var ControllerError = errors.ControllerError;
        var error = new ControllerError();

        expect(error.name).toBe('ControllerError');
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
        expect(error.displayClient).toBe(false);
        expect(error.controller).toBe('empty');
        expect(error.resource).toBe('empty');
        expect(error instanceof ControllerError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an AccountError with message', function() {
        var error = new errors.AccountError('AccountTestError');

        expect(error.message).toBe('AccountTestError');
        expect(error instanceof errors.AccountError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an AccountError without message', function() {
        var error = new errors.AccountError();

        expect(error.message).toBe('Internal Server Error');
        expect(error instanceof errors.AccountError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should throw an SettingsError with message', function() {
        var error = new errors.SettingsError('SettingsTestError');

        expect(error.message).toBe('SettingsTestError');
        expect(error instanceof errors.SettingsError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
    it('should throw an SettingsError without message', function() {
        var error = new errors.SettingsError();

        expect(error.message).toBe('Internal Server Error');
        expect(error instanceof errors.SettingsError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});