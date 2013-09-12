/*global angular*/
angular.module('session', []).
    config(function ($routeProvider) {
        $routeProvider.when('/session', {templateUrl: '/session/session.html', controller: 'sessionCtrl'});
    }).
    controller('sessionCtrl', ['$scope', 'lxSession', '$log', function ($scope, lxSession, $log) {

        $scope.getLastActivity = function() {
            lxSession.getLastActivity(function(err, data) {
                if(err) {
                    $log.error(err);
                }
                else {
                    var now = new Date(data.activity);
                    $log.info('last activity is ' + now);
                }
            });
        };
        $scope.setActivity = function(){
            var now = new Date();
            $log.info('set activity to ' + now);
            lxSession.setActivity();
        };
        $scope.setData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0 || typeof $scope.data.value === 'undefined' ||
                $scope.data.value.length === 0) {

                $log.error('for save in session is key and value required');
            }
            else {
                lxSession.setData($scope.data.key, $scope.data.value, function (err, res) {
                    if (err) {
                        $log.error(err);
                    }
                    else {
                        $log.info(res);
                    }
                });
            }
        };
        $scope.getData = function () {

            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                $log.info('get all session data');

                lxSession.getData(function (err, res) {
                    if (err) {
                        $log.error(err);
                    }
                    else {
                        $log.info(res);
                    }
                });
            }
            else {
                $log.info('get key: ' + $scope.data.key);

                lxSession.getData($scope.data.key, function (err, res) {
                    if (err) {
                        $log.error(err);
                    }
                    else {
                        $log.info(res);
                    }
                });
            }
        };
        $scope.deleteData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                $log.info('set no key, delete all objects in session.data');

                lxSession.deleteData(function (err, res) {
                    if (err) {
                        $log.error(err);
                    }
                    else {
                        $log.info(res);
                    }
                });
            }
            else {
                $log.info('delete ' + $scope.data.key + ' in session.data');

                lxSession.deleteData($scope.data.key, function (err, res) {
                    if (err) {
                        $log.error(err);
                    }
                    else {
                        $log.info(res);
                    }
                });
            }
        };
    }]);
