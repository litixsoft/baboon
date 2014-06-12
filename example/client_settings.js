'use strict';

module.exports.schema = {
    properties: {
        language: {
            type: 'string',
            maxLength: 5
        },
        test: {
            type: 'integer'
        },
        demo: {
            type: 'boolean'
        }
    }
};

module.exports.settings = {
    language: 'de-de',
    test: 1
};