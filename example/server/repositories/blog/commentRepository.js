'use strict';
var lxDb = require('lx-mongodb');
var lxHelpers = require('lx-helpers');
var val = require('lx-valid');

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
        baseRepo = lxDb.BaseRepo(collection, schema);

    baseRepo.validate = function (doc, options, callback) {
        doc = doc || {};

        if (typeof options === 'function') {
            callback = options;
            options = {};
            options.schema = schema();
            options.isUpdate = false;
        } else {
            options = options || {};
            options.schema = options.schema || schema();
            options.isUpdate = options.isUpdate || false;
        }

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

    return baseRepo;
};

