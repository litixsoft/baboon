'use strict';

var lxDb = require('../lx-mongodb-core'),
    val = require('lx-valid');

/**
 * rightsRepository
 *
 * @param collection
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
                        maxLength: 1000,
                        sort: 1
                    },
                    description: {
                        type: 'string',
                        maxLength: 5000
                    },
                    controller: {
                        type: 'string',
                        maxLength: 5000
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema),
        validationFunction = val.getValidationFunction(baseRepo.getValidationOptions());

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

        callback(null, valResult);
    };

    return baseRepo;
};