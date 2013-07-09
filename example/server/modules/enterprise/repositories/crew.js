module.exports = function (collection) {
    'use strict';

    var lxDb = require('lx-mongodb');
    var val = require('lx-valid');
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
                },
                'description': {
                    'type': 'string',
                    'required': true
                }
            }
        };
    };
    var baseRepo = lxDb.BaseRepo(collection, schema);

    collection.ensureIndex({'userName': 1}, {unique: true}, function (error) {
        if (error) {
            console.error(error);
        }
    });

    // validators
    baseRepo.checkUserName = function (userName, cb) {
        collection.findOne({userName: userName}, function (err, res) {

            if (err) {
                cb(err);
            } else if (res) {
                cb(null, {valid: false, errors: [
                    {attribute: 'checkUserName',
                        property: 'userName', expected: false, actual: true,
                        message: 'userName already exists'}
                ]});
            }
            else {
                cb(null, {valid: true});
            }
        });
    };

    baseRepo.validate = function (doc, isUpdate, schema, cb) {

        var nameCheck = true;

        // check is update
        if (isUpdate) {
            // Todo Prüfung auf required fields
            for (var schemaProp in schema.properties) {
                if (schema.properties.hasOwnProperty(schemaProp)) {
                    if (!doc.hasOwnProperty(schemaProp)) {
                        schema.properties[schemaProp].required = false;
                    }
                }
            }

            if (!doc.hasOwnProperty('name')) {
                nameCheck = false;
            }
        }

        // json schema validate
        var valResult = val.validate(doc, schema, baseRepo.getValidationOptions());

        // register async validator
        if (nameCheck) {
            //noinspection JSUnresolvedVariable
            val.asyncValidate.register(baseRepo.checkUserName, doc.name);
        }

        // async validate
        //noinspection JSUnresolvedVariable
        val.asyncValidate.exec(valResult, cb);
    };

    return baseRepo;
};
