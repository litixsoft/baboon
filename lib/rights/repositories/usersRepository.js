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
                        format: 'email'
                    },
                    groups: {
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
                        maxLength: 100
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    // validation of customer number
    baseRepo.checkUsername = function (doc, callback) {
        var query = {
            name: doc.name,
            _id: {
                $ne: baseRepo.convertId(doc._id)
            }
        };

        baseRepo.getOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'Name',
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

    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = options || {};

        // schema validation
        var valResult = validationFunction(doc, options.schema || schema(), options);

        // register async validator
        val.asyncValidate.register(baseRepo.checkUsername, doc);

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return baseRepo;
};