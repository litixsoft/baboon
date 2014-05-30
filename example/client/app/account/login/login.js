'use strict';

angular.module('account.login', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/account/login', {templateUrl: 'app/account/login/login.html', controller: 'AccountLoginCtrl'});
    })
    .controller('AccountLoginCtrl', function ($scope, $bbcForm, $bbcTransport, $translate, $log, $window) {

        $scope.$bbcForm = $bbcForm('accountLoginCtrl', '_id');
        $scope.user = {};
        $scope.authFailed = false;
        $scope.authError = false;
        $scope.guestError = false;

        $scope.login = function () {

            if ($scope.form) {
                $scope.form.errors = {};
            }

            $bbcTransport.rest('api/auth/login', {user: $scope.user}, function (error, result) {

                if (!error && result) {
                    $window.location.href = '/';
                }
                else {

                    if (error.status === 403) {
                        $scope.authFailed = true;
                    }
                    else if (error.status === 400) {
                        $scope.guestError = true;
                    }
                    else {
                        $scope.authError = true;
                    }

                    $log.error(error);
                }
            });
        };
    });
