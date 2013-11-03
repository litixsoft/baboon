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
                    name: {
                        type: 'string',
                        required: true,
                        sort: 1,
                        minLength: 2
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    // validators
    baseRepo.checkTagName = function (tagName, callback) {
        baseRepo.getOne({name: tagName}, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null, {valid: false, errors: [
                    {
                        attribute: 'checkTagName',
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
        var checkTagName = true;

        if (options.isUpdate) {
            if (!doc.hasOwnProperty('name')) {
                checkTagName = false;
            }
        }

        // register async validator
        if (checkTagName) {
            val.asyncValidate.register(baseRepo.checkTagName, doc.name);
        }

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return baseRepo;
};
