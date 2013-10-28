/*global angular */
angular.module('mocks', [])
    .factory('lxSocket', function () {
        return {
            on: function (eventName, callback) {
                callback(eventName);
            },
            emit: function (eventName, data, callback) {
                callback(data);
            }
        };
    })
    .factory('lxSession', function () {
        return {
            getLastActivity: function (callback) {
                callback({}, {});
            },
            setActivity: function (callback) {
                callback({}, {});
            }
        };
    })
    .factory('lxTransport', function () {
        return {
            emit: function (eventName, data, callback) {
                if (data.error) {
                    callback(data.error);
                } else {
                    callback(null, data);
                }
                // callback(data);
            }
        };
    });