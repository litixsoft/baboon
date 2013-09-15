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

    // validators
    baseRepo.checkName = function (name, callback) {
        baseRepo.getOne({name: name}, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null, {valid: false, errors: [
                    {
                        attribute: 'checkName',
                        property: 'name',
                        expected: false,
                        actual: true,
                        message: 'name already exists'
                    }
                ]});
            }
            else {
                callback(null, {valid: true});
            }
        });
    };

    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        doc = doc || {};
        options = options || {};

        var valResult = validationFunction(doc, options.schema || schema(), options);
        var checkName = true;

        if (options.isUpdate) {
            if (!doc.hasOwnProperty('name')) {
                checkName = false;
            }
        }

        // register async validator
        if (checkName) {
            val.asyncValidate.register(baseRepo.checkName, doc.name);
        }

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return baseRepo;
};
