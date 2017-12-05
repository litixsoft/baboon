'use strict';

var lxDb = require('../lx-mongodb-core'),
    val = require('lx-valid');

/**
 * GroupRepository
 *
 * @param {Object} collection
 * @returns {BaseRepo}
 */
module.exports = function (collection) {
    var schema = function () {
            return {
                properties: {
                    _id: {
                        type: 'string',
                        format: 'mongo-id',
                        key: true
                    },
                    name: {
                        type: 'string',
                        required: true,
                        maxLength: 100
                    },
                    description: {
                        type: 'string',
                        maxLength: 5000
                    },
                    roles: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'mongo-id'
                        }
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

    /**
     * Validation of group name.
     *
     * @param {!Object} doc The document.
     * @param {string=} doc.name The name.
     * @param {(Object|string)=} doc._id The id.
     * @param {!function} callback The callback function. ({?Object}, {?Object})
     */
    baseRepo.checkName = function (doc, callback) {
        if (!doc) {
            callback(null, {valid: true});
            return;
        }

        var query = {
            name: { $regex : new RegExp('^' + doc.name + '$', 'i') },
            _id: {
                $ne: typeof doc._id === 'string' ? baseRepo.convertId(doc._id) : doc._id
            }
        };

        baseRepo.findOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'Name',
                                property: 'name',
                                expected: false,
                                actual: true,
                                message: 'GROUP_ALREADY_EXISTS'
                            }
                        ]
                    }
                );
            } else {
                callback(null, {valid: true});
            }
        });
    };

    /**
     * Validate
     *
     * @param {!Object} doc
     * @param {?Object} options
     * @param {Function} callback
     */
    baseRepo.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

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