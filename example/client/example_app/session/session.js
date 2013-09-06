/*global angular*/
angular.module('sessionDoc', []).
    config(function ($routeProvider) {
        $routeProvider.when('/session', {templateUrl: '/session/session.html', controller: 'sessionDocCtrl'});
    }).
    controller('sessionDocCtrl', ['$scope', 'session', '$log', function ($scope, session, $log) {

        $scope.getLastActivity = function() {
            session.getLastActivity(function(err, data) {
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
            session.setActivity();
        };
        $scope.setData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0 || typeof $scope.data.value === 'undefined' ||
                $scope.data.value.length === 0) {

                $log.error('for save in session is key and value required');
            }
            else {
                session.setData($scope.data.key, $scope.data.value, function (err, res) {
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

                session.getData(function (err, res) {
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

                session.getData($scope.data.key, function (err, res) {
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

                session.deleteData(function (err, res) {
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

                session.deleteData($scope.data.key, function (err, res) {
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
