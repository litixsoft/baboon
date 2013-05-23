/*global angular*/
angular.module('login.services', [])
    .factory('session', function (socket) {
        var pub = {};

        pub.getAll = function (callback) {

            socket.emit('session:getAll', {}, function (data) {
                // convert date
                data.activity = new Date(data.activity);
                callback(data);
            });

        };

        return pub;
    });
