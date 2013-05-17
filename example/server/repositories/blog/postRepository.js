'use strict';
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
        lxDb = require('lx-mongodb'),
        val = require('lx-valid'),
        lxHelpers = require('lx-helpers'),
        baseRepo = lxDb.BaseRepo(collection, schema);

    baseRepo.validate = function (doc, options, callback) {
        doc = doc || {};
        options = options || {};
        options.schema = options.schema || schema();
        options.isUpdate = options.isUpdate || false;

        // check is update
        if (options.isUpdate) {
            lxHelpers.objectForEach(options.schema.properties, function (key) {
                if (!doc.hasOwnProperty(key)) {
                    options.schema.properties[key].required = false;
                }
            });
        }

        // json schema validate
        var valResult = val.validate(doc, options.schema, baseRepo.getValidationOptions());

        callback(null, valResult);
    };

//    collection.ensureIndex({'created': 1}, null, function (error) {
//        if (error) {
//            console.error(error);
//        }
//    });

//    baseRepo.getTitles = function (options, cb) {
//
//        if (arguments.length === 1) {
//            cb = options;
//            options = {};
//        }
//
//        if (typeof options !== 'object') {
//            throw new Error('options must be of function type');
//        }
//
//        if (typeof cb !== 'function') {
//            throw new Error('callback must be of function type');
//        }
//
//        if (!options.hasOwnProperty('sort')) {
//            options.sort = -1;
//        }
//
//        options.projection = {title: 1};
//
//        baseRepo.getAll(options, cb);
//    };

    return baseRepo;
};
