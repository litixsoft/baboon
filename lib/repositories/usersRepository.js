'use strict';

var lxDb = require('lx-mongodb'),
    val = require('lx-valid');

/**
 * usersRepository
 *
 * @param collection
 * @returns {BaseRepo}
 */
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
                        required: true
                    },
                    language: {
                        type: 'string',
                        maxLength: 10
                    },
                    password: {
                        type: 'string',
                        dependencies: 'confirmed_password'
                    },
                    salt: {
                        type: 'string'
                    },
                    is_approved: {
                        type: 'boolean'
                    },
                    register_date: {
                        type: 'date'
                    },
                    token: {
                        type: 'string',
                        maxLength: 100
                    },
                    confirmed_password: {
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
                    display_name: {
                        type: 'string',
                        maxLength: 100,
                        minLength: 4
                    },
                    settings: {
                        type: 'any'
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

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
                                message: 'already exists'
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
     * Validation fo duplicate mail.
     *
     * @param {!Object} doc The document.
     * @param {!function({}, {})} callback The callback function.
     */
    baseRepo.checkMail = function (doc, callback) {
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
                                attribute: 'checkMail',
                                property: 'email',
                                expected: false,
                                actual: true,
                                message: 'already exists'
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
        val.asyncValidate.register(baseRepo.checkMail, doc);

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    /**
     * Creates a user in the db. Convert the password in a hash and salt.
     *
     * @param {!Object} user The user object.
     * @param {!function(err, res)} callback The callback function.
     */
    baseRepo.createUser = function (user, callback) {
        user = user || {};
        user.is_approved = false;
        user.register_date = new Date();
        delete user.confirmed_password;

        baseRepo.insert(user, function (error, results) {
            if (error) {
                return callback(error);
            }

            // remove protected fields
            delete results[0].password;
            delete results[0].salt;
            delete results[0].is_approved;
            delete results[0].register_date;

            callback(null, results[0]);
        });
    };

    baseRepo.getUserForLogin = function (name, callback) {
        baseRepo.findOne({name: name}, {fields: ['name', 'password', 'salt']}, function (error, result) {
            if (error) {
                //logging.syslog.error('%s! getting user from db: %j', error.toString(), name);
                callback(error);
                return;
            }

            callback(null, result);
        });
    };

    return baseRepo;
};