/*global angular */
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