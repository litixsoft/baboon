'use strict';
var lxDb = require('lx-mongodb'),
    val = require('lx-valid'),
    lxHelpers = require('lx-helpers');

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
        baseRepo = lxDb.BaseRepo(collection, schema);

//    collection.ensureIndex({'tagName': 1}, {unique: true}, function (error) {
//        if (error) {
//            console.error(error);
//        }
//    });

    // validators
    baseRepo.checkTagName = function (tagName, cb) {
        baseRepo.getOne({name: tagName}, function (err, res) {
            if (err) {
                cb(err);
            } else if (res) {
                cb(null, {valid: false, errors: [
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
                cb(null, {valid: true});
            }
        });
    };

    baseRepo.validate = function (doc, options, cb) {
        var checkTagName = true;
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

            if (!doc.hasOwnProperty('name')) {
                checkTagName = false;
            }
        }

        // json schema validate
        var valResult = val.validate(doc, options.schema, baseRepo.getValidationOptions());

        // register async validator
        if (checkTagName) {
            val.asyncValidate.register(baseRepo.checkTagName, doc.name);
        }

        // async validate
        val.asyncValidate.exec(valResult, cb);
    };

    return baseRepo;
};
