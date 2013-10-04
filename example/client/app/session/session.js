/*global angular*/
angular.module('app.session', []).
    config(function ($routeProvider) {
        $routeProvider.when('/session', {templateUrl: 'session/session.html', controller: 'appSessionCtrl'});
    }).
    controller('appSessionCtrl', ['$scope', 'lxSession', '$log', function ($scope, lxSession, $log) {

        $scope.logs_1 = [];
        $scope.logs_2 = [];

        function log(box, msg) {

            if (arguments.length ===  1) {
                msg = box;
                box = 0;
            }

            if (box === 1) {
                $scope.logs_1.push(msg);
            }
            else if (box === 2) {
                $scope.logs_2.push(msg);
            }
            else {
                $log.info(msg);
            }
        }

        $scope.getLastActivity = function() {
            lxSession.getLastActivity(function(err, data) {
                if(err) {
                    log(1, err);
                }
                else {
                    var now = new Date(data.activity);
                    log(1, 'last activity is ' + now);
                }
            });
        };
        $scope.setActivity = function(){
            var now = new Date();
            log(1, 'set activity to ' + now);
            lxSession.setActivity(function(err) {
                if(err) {
                    log(1, err);
                }
            });
        };
        $scope.setData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0 || typeof $scope.data.value === 'undefined' ||
                $scope.data.value.length === 0) {

                log(2, 'for save in session is key and value required');
            }
            else {
                lxSession.setData($scope.data.key, $scope.data.value, function (err, res) {
                    if (err) {
                        log(2, err);
                    }
                    else {
                        log(2, res);
                    }
                });
            }
        };
        $scope.getData = function () {

            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                log(2, 'get all session data');

                lxSession.getData(function (err, res) {
                    if (err) {
                        log(2, err);
                    }
                    else {
                        log(2, res);
                    }
                });
            }
            else {
                log(2, 'get key: ' + $scope.data.key);

                lxSession.getData($scope.data.key, function (err, res) {
                    if (err) {
                        log(2, err);
                    }
                    else {
                        log(2, res);
                    }
                });
            }
        };
        $scope.deleteData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                log(2, 'set no key, delete all objects in session.data');

                lxSession.deleteData(function (err, res) {
                    if (err) {
                        log(2, err);
                    }
                    else {
                        log(2, res);
                    }
                });
            }
            else {
                log(2, 'delete ' + $scope.data.key + ' in session.data');

                lxSession.deleteData($scope.data.key, function (err, res) {
                    if (err) {
                        log(2, err);
                    }
                    else {
                        log(2, res);
                    }
                });
            }
        };
        $scope.clearLog = function(log) {
            if (log === 1) {
                $scope.logs_1 = [];
            }
            else if (log === 2) {
                $scope.logs_2 = [];
            }
        };
    }]);
