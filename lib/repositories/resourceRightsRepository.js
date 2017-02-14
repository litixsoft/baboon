'use strict';

var lxDb = require('../lx-mongodb-core'),
    val = require('lx-valid');

/**
 * ResourceRightsRepository
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
                    resource: {
                        type: 'any'
                    },
                    group_id: {
                        type: 'string',
                        format: 'mongo-id'
                    },
                    user_id: {
                        type: 'string',
                        format: 'mongo-id'
                    },
                    role_id: {
                        type: 'string',
                        format: 'mongo-id'
                    },
                    right_id: {
                        type: 'string',
                        format: 'mongo-id'
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