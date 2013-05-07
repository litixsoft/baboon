'use strict';
var lxDb = require('lx-mongodb');

module.exports = function (collection) {
    var schema = function () {
            return {
                'properties': {
                    '_id': {
                        'type': 'string',
                        'required': false,
                        'format': 'mongo-id',
                        'key': true
                    },
                    'name': {
                        'type': 'string',
                        'required': true,
                        'sort': 1
                    }
                }
            };
        },
        val = require('lx-valid'),
        baseRepo = lxDb.BaseRepo(collection, schema);

//    collection.ensureIndex({'tagName': 1}, {unique: true}, function (error) {
//        if (error) {
//            console.error(error);
//        }
//    });

    // validators
    baseRepo.checkTagName = function (tagName, cb) {
        collection.findOne({tagName: tagName}, function (err, res) {
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

    baseRepo.validate = function (doc, isUpdate, schema, cb) {
        var checkTagName = true;

        // check is update
        if (isUpdate) {
            for (var schemaProp in schema.properties) {
                if (schema.properties.hasOwnProperty(schemaProp)) {
                    if (!doc.hasOwnProperty(schemaProp)) {
                        schema.properties[schemaProp].required = false;
                    }
                }
            }

            if (!doc.hasOwnProperty('name')) {
                checkTagName = false;
            }
        }

        // json schema validate
        var valResult = val.validate(doc, schema, baseRepo.getValidationOptions());

        // register async validator
        if (checkTagName) {
            val.asyncValidate.register(baseRepo.checkTagName, doc.name);
        }

        // async validate
        val.asyncValidate.exec(valResult, cb);
    };

    return baseRepo;
};
