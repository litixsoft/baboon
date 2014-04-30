module.exports = function (collection) {
    'use strict';

    var lxDb = require('lx-mongodb');
    var val = require('lx-valid');
    var schema = function () {
            return {
                properties: {
                    _id: {
                        type: 'string',
                        required: false,
                        format: 'mongo-id',
                        key: true
                    },
                    name: {
                        type: 'string',
                        required: true,
                        sort: 1,
                        minLength: 2
                    },
                    description: {
                        type: 'string',
                        required: false,
                        minLength: 2
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    // async validator: check if name already exists
    baseRepo.checkName = function (doc, callback) {

        // query search the name in other documents
        var query = {
            name: doc.name,
            _id: {
                $ne: typeof doc._id === 'string' ? baseRepo.convertId(doc._id) : doc._id
            }
        };

        // get query
        baseRepo.findOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {

                // find name in other documents, validation error
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'checkName',
                                property: 'name',
                                expected: false,
                                actual: true,
                                message: 'name already exists'
                            }
                        ]
                    }
                );
            }
            else {
                callback(null, {valid: true});
            }
        });
    };

    // start validation
    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        doc = doc || {};
        options = options || {};

        // schema validation
        var valResult = validationFunction(doc, options.schema || schema(), options);

        // register async validator
        val.asyncValidate.register(baseRepo.checkName, doc);

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return baseRepo;
};
