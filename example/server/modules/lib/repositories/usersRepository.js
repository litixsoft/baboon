'use strict';

var lxDb = require('lx-mongodb'),
    val = require('lx-valid');

module.exports = function (collection) {
    var schema = function () {
            return {
                properties: {
                    _id: {
                        type: 'string',
                        format: 'mongo-id',
                        key: true
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        required: true,
                        dependencies: 'confirmedEmail'
                    },
                    confirmedEmail: {
                        type: 'string',
                        conform: function (actual, data) {
                            return actual === data.email;
                        }
                    },
                    language: {
                        type: 'string',
                        maxLength: 10
                    },
                    password: {
                        type: 'string',
                        maxLength: 100,
                        dependencies: 'confirmedPassword'
                    },
                    confirmedPassword: {
                        type: 'string',
                        conform: function (actual, data) {
                            return actual === data.password;
                        }
                    },
                    groups: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'mongo-id'
                        }
                    },
                    roles: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'mongo-id'
                        }
                    },
                    rights: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                _id: {
                                    type: 'string',
                                    format: 'mongo-id',
                                    required: true
                                },
                                hasAccess: {
                                    type: 'boolean',
                                    required: true
                                }
                            }
                        }
                    },
                    name: {
                        type: 'string',
                        required: true,
                        maxLength: 100,
                        minLength: 4
                    },
                    displayName: {
                        type: 'string',
                        maxLength: 100,
                        minLength: 4
                    },
                    firstName: {
                        type: 'string',
                        maxLength: 100,
                        minLength: 4
                    },
                    lastName: {
                        type: 'string',
                        maxLength: 100,
                        minLength: 4
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    /**
     * Validation of email.
     *
     * @param {!Object} doc The document.
     * @param {string=} doc.email The email.
     * @param {(Object|string)=} doc._id The id.
     * @param {!function({}, {})} callback The callback function.
     */
    baseRepo.checkEmail = function (doc, callback) {
        if (!doc) {
            callback(null, {valid: true});
            return;
        }

        var query = {
            email: doc.email,
            _id: {
                $ne: typeof doc._id === 'string' ? baseRepo.convertId(doc._id) : doc._id
            }
        };

        baseRepo.findOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'checkEmail',
                                property: 'email',
                                expected: false,
                                actual: true,
                                message: 'Email already exists.'
                            }
                        ]
                    }
                );
            } else {
                callback(null, {valid: true});
            }
        });
    };

    /**
     * Validation of name.
     *
     * @param {!Object} doc The document.
     * @param {string=} doc.name The name of the user.
     * @param {(Object|string)=} doc._id The id.
     * @param {!function({}, {})} callback The callback function.
     */
    baseRepo.checkName = function (doc, callback) {
        if (!doc) {
            callback(null, {valid: true});
            return;
        }

        var query = {
            name: doc.name,
            _id: {
                $ne: typeof doc._id === 'string' ? baseRepo.convertId(doc._id) : doc._id
            }
        };

        baseRepo.findOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'checkName',
                                property: 'name',
                                expected: false,
                                actual: true,
                                message: 'Name already exists.'
                            }
                        ]
                    }
                );
            } else {
                callback(null, {valid: true});
            }
        });
    };

    /**
     * validate
     *
     * @param doc
     * @param options
     * @param callback
     */
    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = options || {};

        // schema validation
        var valResult = validationFunction(doc, options.schema || schema(), options);

        // register async validator
        val.asyncValidate.register(baseRepo.checkName, doc);
        val.asyncValidate.register(baseRepo.checkEmail, doc);

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return baseRepo;
};