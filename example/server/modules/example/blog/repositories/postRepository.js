'use strict';

var lxDb = require('lx-mongodb'),
    val = require('lx-valid');

module.exports = function (collection) {
    var schema = function () {
            return {
                properties: {
                    _id: {
                        type: 'string',
                        required: false,
                        format: 'mongo-id',
                        key: true
                    },
                    title: {
                        type: 'string',
                        minLength: 2,
                        required: true
                    },
                    author: {
                        type: 'string',
                        required: false,
                        format: 'mongo-id'
                    },
                    content: {
                        type: 'string',
                        required: true
                    },
                    comments: {
                        type: 'array',
                        required: false,
                        items: {
                            type: 'object',
                            required: true,
                            properties: {
                                _id: {
                                    type: 'string',
                                    required: true,
                                    format: 'mongo-id'
                                }
                            }
                        }
                    },
                    tags: {
                        type: 'array',
                        required: false,
                        items: {
                            type: 'string',
                            format: 'mongo-id'
                        }
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = options || {};

        // json schema validate
        var valResult = validationFunction(doc, options.schema || schema(), options);

        callback(null, valResult);
    };

    return baseRepo;
};
