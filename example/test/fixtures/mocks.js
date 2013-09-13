/*global angular, io:true */
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
    .factory('lxSession', function() {
        return {
            getLastActivity: function (callback) {
                callback({},{});
            },
            setActivity: function (callback) {
                callback({},{});
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