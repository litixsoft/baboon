'use strict';
angular.module('common.auth', [])
    .controller('CommonAuthLoginCtrl', function ($scope, lxForm, lxAuth, $window, $log) {

        $scope.lxForm = lxForm('authViewLoginCtrl', '_id');
        $scope.user = {};

        $scope.authFailed = false;
        $scope.serverError = false;

        $scope.login = function () {

            if ($scope.form) {
                $scope.form.errors = {};
            }

            lxAuth.login($scope.user.username, $scope.user.password, function (error, result) {
                if (result && !error) {
//                        lxAlert.success('User '+$scope.user.username+' erfolgreich registriert.');
                    $window.location.href = '/';
                }
                else {
                    if (error === 403 || error === 401) {
                        $log.error('Error ' + error + ' auth Failed!');
                        $scope.errorMsg = 'Error ' + error + ' auth Failed!';
                        $scope.authFailed = true;
                    }
                    else {
                        if (error.validation) {
                            $scope.lxForm.populateValidation($scope.form, error.validation);
                            $scope.authFailed = true;
                        } else {
                            $scope.serverError = false;
                            $scope.errorMsg = 'Error ' + error + ' internal server error!';
                            $log.error('Error ' + error + ' internal server error!');
                        }
                    }
                }
            });
        };
    });