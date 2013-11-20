/*global angular*/
angular.module('lx.auth.services', [])
    .factory('lxAuth', ['$http', '$log', 'lxTransport', function ($http, $log, transport) {
        var pub = {};

        pub.getAuthData = function(callback) {
            transport.rest('auth/getAuthData', function (error, result) {
                if (error) {
                    $log.error(error);
                    callback({isAuth: false, username: 'Guest'});
                }
                else {
                    callback(result);
                }
            });
        };

//        pub.register = function (user, callback) {
//            $http.post('/api/auth/register', user)
//                .success(function (data) {
//                    callback(null, data);
//                })
//                .error(function (data, status) {
//                    callback({status: status, data: data});
//                });
//        };

        pub.login = function (username, password, callback) {
            transport.rest('auth/login', {username: username, password: password}, callback);
        };

        return pub;
    }]);

