'use strict';
angular.module('common.auth', [])
    .controller('CommonAuthLoginCtrl', function ($scope, $bbcForm, $bbcTransport, $translate, $log, $window, $bbcSession) {



        $scope.$bbcForm = $bbcForm('accountLoginCtrl', '_id');
        $scope.user = {};
        $scope.authFailed = false;
        $scope.authError = false;
        $scope.guestError = false;

        $bbcSession.getUserDataForClient(function(error,result){
            if(error){
                $log.warn(error);
            }
            if(result){
                $scope.userName = result.username;
                $scope.isLoggedIn = result.isLoggedIn;
                $scope.rightSystem = result.rightssystem;
            }
        });


        $scope.login = function () {

            if ($scope.form) {
                $scope.form.errors = {};
            }

            $bbcTransport.rest('api/lib/auth/login', {user: $scope.user}, function (error, result) {

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