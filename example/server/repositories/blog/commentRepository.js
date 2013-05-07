'use strict';

module.exports = function (collection, lxDb) {
    var schema = function () {
            return {
                properties: {
                    _id: {
                        type: 'string',
                        required: false,
                        format: 'mongo-id',
                        key: true
                    },
                    author: {
                        type: 'string',
                        required: false,
                        format: 'mongo-id'
                    },
                    body: {
                        type: 'string',
                        required: true
                    },
                    created: {
                        type: 'string',
                        required: true,
                        format: 'dateTime',
                        sort: -1
                    },
                    email: {
                        type: 'string',
                        required: false,
                        format: 'email'
                    },
                    username: {
                        type: 'string',
                        required: false
                    }
                }
            };
        },
        baseRepo = lxDb.BaseRepo(collection, schema);

//    collection.ensureIndex({'created': 1}, null, function (error) {
//        if (error) {
//            console.error(error);
//        }
//    });

    return baseRepo;
};

