/*global angular, io:true */
angular.module('mocks', [])
    .factory('socket', function () {
        return {
            on: function (eventName, callback) {
                callback(eventName);
            },
            emit: function (eventName, data, callback) {
                callback(data);
            }
        };
    });

// socket io mock
io = {
    connect: function () {
        return {
            on: function () {},
            emit: function () {}
        };
    }
};