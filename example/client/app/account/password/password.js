'use strict';

angular.module('account.password', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/account/password', {templateUrl: 'app/account/password/password.html', controller: 'AccountPasswordCtrl'});
    })
    .controller('AccountPasswordCtrl', function ($scope, $bbcTransport, $translate) {
        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.send = function () {
            if ($scope.form && !$scope.form.$valid) {
                return;
            }

            if ($scope.form) {
                $scope.form.errors = {};
            }

            $scope.user.language = $translate.use();

            $bbcTransport.emit('api/account/resetPassword', $scope.user, function (error, result) {
                $scope.alerts.length = 0;

                if (!error && result) {
                    $scope.alerts.push({ type: 'success', msg: 'RESET_PASSWORD_MSG' });
                    $scope.user = {};
                    $scope.form.$setPristine();
                }
                else {
                    if (error.name === 'ValidationError') {
                        for (var i = 0; i < error.errors.length; i++) {
                            $scope.form.errors[error.errors[i].property] = error.errors[i].attribute.toUpperCase();
                        }
                    }
                    else {
                        $scope.alerts.push({ type: 'danger', msg: 'GENERIC_ERROR' });
                    }
                }
            });
        };
    });
