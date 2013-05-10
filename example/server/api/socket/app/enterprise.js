module.exports = function() {
    'use strict';

    var result = {},
//        base = require('../base'),
        enterpriseMock = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];

    result.getAll = function (data, callback) {
        callback(enterpriseMock);
    };

    result.getById = function (data, callback) {
        callback(enterpriseMock[data.id]);
    };

    result.updateById = function (data, callback) {
        enterpriseMock[data.id] = data.person;
        callback('update successfully..');
    };

    result.create = function (data, callback) {
        enterpriseMock.push(data.person);
        callback('create successfully..');
    };

    // register resources
//    base.register('enterprise', socket, acl, res);

    return result;
};
