/*global angular*/
angular.module('lx.session', [])
    // Service for session handling
    .factory('lxSession', ['$rootScope', '$http', '$log', 'msgBox', function ($rootScope, $http, $log, msgBox) {
        var pub = {};

        // save key value in session
        pub.setData = function (key, value, callback) {

            if (arguments.length === 3) {
                $http.post('/api/session/setData', {key: key, value: value})
                    .success(function (data) {
                        callback(null, data);
                    })
                    .error(function (data, status) {
                        callback({status: status, data: data});
                    });
            }
            else {
                $log.error('parameter error, required key, value and callback');
            }
        };

        // delete key value in session
        pub.deleteData = function (key, callback) {

            if (arguments.length === 1) {
                callback = key;
                key = null;

                $http.post('/api/session/deleteData')
                    .success(function (data) {
                        callback(null, data);
                    })
                    .error(function (data, status) {
                        callback({status: status, data: data});
                    });
            }
            else {
                $http.post('/api/session/deleteData', {key: key})
                    .success(function (data) {
                        callback(null, data);
                    })
                    .error(function (data, status) {
                        callback({status: status, data: data});
                    });
            }
        };

        // get key value from session
        pub.getData = function (key, callback) {

            if (arguments.length === 1) {
                callback = key;
                key = null;
                $http.post('/api/session/getData')
                    .success(function (data) {
                        callback(null, data);
                    })
                    .error(function (data, status) {
                        callback({status: status, data: data});
                    });
            }
            else {
                $http.post('/api/session/getData', {key: key})
                    .success(function (data) {
                        callback(null, data);
                    })
                    .error(function (data, status) {
                        callback({status: status, data: data});
                    });
            }
        };

        // check session and set activity time
        pub.getLastActivity = function (callback) {
            $http.post('/api/session/getLastActivity')
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (data, status) {
                    if (status === 500) {
                        $log.error(data.message);
                    } else {
                        $log.warn(data.message);
                    }
                });
        };

        // check session and set activity time
        pub.setActivity = function () {
            $http.post('/api/session/setActivity')
                .error(function (data, status) {
                    if (status === 500) {
                        $log.error(data.message);
                    } else {
                        $log.warn(data.message);
                    }

                    msgBox.modal.show('','Session is expired! Please log in.', 'Warning', function () {
                        window.location.assign('/login');
                    });
                });
        };

        return pub;
    }]);
