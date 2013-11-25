/*global angular*/
angular.module('lx.auth.services', [])
    .factory('lxAuth', ['$http', '$log', 'lxTransport', function ($http, $log, transport) {
        var pub = {};

        pub.getAuthData = function(callback) {
            transport.rest('auth/getAuthData', function (error, result) {
                if (error) {
                    $log.error(error);
                    callback({isAuth: false, name: 'Guest'});
                }
                else {
                    callback(result);
                }
            });
        };

        pub.register = function (user, callback) {
            transport.emit('lib/register/registerUser', user, callback);
        };

        pub.activate = function (user, callback) {
            transport.emit('lib/register/activateUser', user, callback);
        };

        pub.forgetPassword = function (data, callback) {
            transport.emit('lib/register/forgetPassword', data, callback);
        };

        pub.resetPassword = function (data, callback) {
            transport.emit('lib/register/resetPassword', data, callback);
        };

        pub.login = function (username, password, callback) {
            transport.rest('auth/login', {username: username, password: password}, callback);
        };

        return pub;
    }]);

