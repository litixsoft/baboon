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
                        required: false,
                        format: 'mongo-id',
                        key: true
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
                    email: {
                        type: 'string',
                        required: false,
                        format: 'email'
                    },
                    username: {
                        type: 'string',
                        required: false
                    }
                }
            };
        },
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

    return baseRepo;
};

