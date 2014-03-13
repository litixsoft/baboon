'use strict';

var util = require('util');

/**
 * ConfigError
 *
 * @param message
 * @constructor
 */
var ConfigError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
};

/**
 * LogError
 *
 * @param message
 * @constructor
 */
var LogError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
};

/**
 * TransportError
 *
 * @param message
 * @constructor
 */
var TransportError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
};

/**
 * ApiError
 *
 * @param status
 * @param message
 * @constructor
 */
var NavigationError = function (status, resource, message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'NavigationError';
    this.message = message || 'Internal Server Error';
    this.status = status || 500;
    this.resource = resource || 'undefined';
};

/**
 * MailError
 *
 * @param message
 * @constructor
 */
var MailError = function (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
};

// inherit from Error
util.inherits(ConfigError, Error);
util.inherits(LogError, Error);
util.inherits(TransportError, Error);
util.inherits(NavigationError, Error);
util.inherits(MailError, Error);

exports.ConfigError = ConfigError;
exports.LogError = LogError;
exports.TransportError = TransportError;
exports.NavigationError = NavigationError;
exports.MailError = MailError;