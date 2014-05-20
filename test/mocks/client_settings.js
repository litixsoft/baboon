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
        },
        start: {
            type: 'string',
            format: 'date'
        },
        mail: {
            type: 'string',
            format: 'email'
        },
        pages: {
            type: 'number',
            format: 'email'
        }
    }
};

module.exports.settings = {
    language: 'de-de',
    test: 1
};