module.exports = function(socket, acl) {
    'use strict';

    var res = {},
        base = require('../base'),
        enterpriseMock = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];

    res.getAll = function (data, callback) {
        callback(enterpriseMock);
    };

    res.getById = function (data, callback) {
        callback(enterpriseMock[data.id]);
    };

    res.updateById = function (data, callback) {
        enterpriseMock[data.id] = data.person;
        callback('update successfully..');
    };

    res.create = function (data, callback) {
        enterpriseMock.push(data.person);
        callback('create successfully..');
    };

    // register resources
    base.register('enterprise', socket, acl, res);
};
