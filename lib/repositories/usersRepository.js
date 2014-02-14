'use strict';

var async = require('async'),
    pwd = require('pwd'),
    lxHelpers = require('lx-helpers'),
    lxDb = require('lx-mongodb'),
    val = require('lx-valid'),
    protectedFields = ['hash', 'salt'];

function createHash (user, callback) {
    if (user.password) {
        pwd.hash(user.password, function (error, salt, hash) {
            if (error) {
                callback(error);
            }

            user.salt = salt;
            user.hash = hash;

            callback(null, user);
        });
    } else {
        callback(null, user);
    }
}

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

        async.auto({
            createPasswordHash: function (next) {
                createHash(user, next);
            },
            createUser: ['createPasswordHash', function (next) {
                // do not save password and confirmedPassword
                delete user.password;
                delete user.confirmedPassword;

                baseRepo.insert(user, next);
            }]
        }, function (error, results) {
            if (error) {
                return callback(error);
            }

            if (results.createUser[0]) {
                // remove protected fields
                lxHelpers.forEach(protectedFields, function (field) {
                    delete results.createUser[0][field];
                });

                callback(null, results.createUser[0]);
            }
        });
    };

    return baseRepo;
};