'use strict';

module.exports = function () {
    var pub = {},
        enterpriseMock = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];

    pub.getAll = function (data, callback) {
        callback(enterpriseMock);
    };

    pub.getById = function (data, callback) {
        callback(enterpriseMock[data.id]);
    };

    pub.updateById = function (data, callback) {
        enterpriseMock[data.id] = data.person;
        callback('update successfully..');
    };

    pub.create = function (data, callback) {
        enterpriseMock.push(data.person);
        callback('create successfully..');
    };

    return pub;
};
