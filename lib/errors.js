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

// inherit from Error
util.inherits(ConfigError, Error);
util.inherits(LogError, Error);

exports.ConfigError = ConfigError;
exports.LogError = LogError;