/*global angular*/
angular.module('lx.auth.services', [])
    .factory('lxAuth', ['$http', function ($http) {
        var pub = {};

        pub.register = function (user, callback) {
            $http.post('/api/auth/register', user)
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (data, status) {
                    callback({status: status, data: data});
                });
        };

        pub.login = function (username, password, callback) {
            //$http.post('/api/auth/login', username, password)
            $http.post('/api/auth/login', {username: username, password: password})
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (data, status) {
                    callback({status: status, data: data});
                });
        };

        return pub;
    }]);

