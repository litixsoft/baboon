'use strict';

var util = require('util');

function ClientError (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
    this.defaultMessage = message;
}

function ValidationError (data) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = 'ValidationError'; //set the error message
    this.defaultMessage = this.message;
    this.data = data; // validation errors data
}

function AuthenticationError (message) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = this.constructor.name; //set our function’s name as error name.
    this.message = message || ''; //set the error message
    this.defaultMessage = 'Login failed';
}

// inherit from Error
util.inherits(ClientError, Error);
util.inherits(ValidationError, Error);
util.inherits(AuthenticationError, Error);

module.exports = {
    ClientError: ClientError,
    ValidationError: ValidationError,
    AuthenticationError: AuthenticationError
};