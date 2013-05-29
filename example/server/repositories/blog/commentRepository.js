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
                    author: {
                        type: 'string',
                        format: 'mongo-id'
                    },
                    content: {
                        type: 'string',
                        required: true
                    },
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    username: {
                        type: 'string'
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

        var res = validationFunction(doc, options.schema || schema(), options);

        callback(null, res);
    };

    return baseRepo;
};

