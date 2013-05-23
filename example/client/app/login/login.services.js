/*global angular*/
angular.module('login.services', [])
    .factory('session', function (socket) {
        var pub = {};

        pub.isAuthenticated = function (callback) {
            socket.emit('session:isAuthenticated', {}, function (data) {
                callback(data);
            });
        };

        pub.getUsername = function (callback) {
            socket.emit('session:getUsername', {}, function (data) {
                callback(data);
            });
        };

        pub.setActivity = function (callback) {
            socket.emit('session:setActivity', {}, function (data) {
                callback(data);
            });
        };

        return pub;
    });
