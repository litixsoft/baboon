'use strict';

var util = require('util');

/**
 * Creates a new ConfigError.
 * @constructor
 *
 * @param {string} message The error message.
 */
var ConfigError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'ConfigError';
    this.message = message || '';
};

/**
 * Creates a new LogError.
 * @constructor
 *
 * @param {string} message The error message.
 */
var LogError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'LogError';
    this.message = message || '';
};

/**
 * Creates a new MailError.
 * @constructor
 *
 * @param {string} message The error message.
 */
var MailError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'MailError';
    this.message = message || '';
};

/**
 * Creates a new NavigationError.
 * @constructor
 *
 * @param message
 * @param status
 * @param displayClient
 */
var NavigationError = function (message, status, displayClient) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor);

    this.name = 'NavigationError';
    this.message = message || 'Internal Server Error';
    this.status = status || 500;
    this.displayClient = displayClient || false;
};

/**
 * Creates a new RightsError.
 * @constructor
 *
 * @param {string} message The error message.
 */
var RightsError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'RightsError';
    this.message = message || '';
};

/**
 * Creates a new SessionError.
 * @constructor
 *
 * @param message
 * @param status
 * @param displayClient
 */
var SessionError = function (message, status, displayClient) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor);

    this.name = 'SessionError';
    this.message = message || 'Internal Server Error';
    this.status = status || 500;
    this.displayClient = displayClient || false;
};

/**
 * Creates a new TransportError.
 * @constructor
 *
 * @param {number} status
 * @param resource
 * @param {string} message The error message.
 */
var TransportError = function (status, resource, message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'TransportError'; //set our function’s name as error name.
    this.message = message || 'Internal Server Error';
    this.status = status || 500;
    this.resource = resource || 'undefined';
};


// inherit from Error
util.inherits(ConfigError, Error);
util.inherits(LogError, Error);
util.inherits(MailError, Error);
util.inherits(NavigationError, Error);
util.inherits(RightsError, Error);
util.inherits(SessionError, Error);
util.inherits(TransportError, Error);

exports.ConfigError = ConfigError;
exports.LogError = LogError;
exports.MailError = MailError;
exports.NavigationError = NavigationError;
exports.RightsError = RightsError;
exports.SessionError = SessionError;
exports.TransportError = TransportError;
