'use strict';
angular.module('common.auth', [])
    .controller('CommonAuthLoginCtrl', function ($scope, $bbcForm, $bbcTransport, $translate, $log, $window, $bbcSession, $modal) {



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

        /**
         * Open the settings modal.
         */
        $scope.editSettings = function () {
            $scope.modalEditSettings = $modal.open({
                backdrop: true, //static, true, false
                modalFade: true,
                controller: 'MainModalsSettingsCtrl',
                keyboard: false,
                templateUrl: 'common/popup_login/popup_settings.html'
            });

//            $scope.modalEditSettings.result.then(function (settings) {
//                setUserSettings(settings);
//            }, angular.noop);
        };

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
    })
    .controller('MainModalsSettingsCtrl', ['$scope', '$bbcTransport', '$modalInstance', '$bbcForm', function ($scope, transport, $modalInstance, lxForm) {

            $scope.lxForm = lxForm('settings', '_id');
            $scope.languages = [{
                                    name: 'ENGLISH',
                                    code: 'en-us',
                                    flagURL: 'assets/images/flag-usa48.png'
                                },
                                {
                                    name: 'GERMAN',
                                    code: 'de-de',
                                    flagURL: 'assets/images/flag-germany48.png'
                                }];

            $scope.test = [0,1,2,3,4,5,6];
            $scope.item = {};


            transport.emit('api/lib/settings/getUserSettings', {}, function (error, result) {

                if (error) {
                    $scope.item.error = error;
                } else if (result) {

                    if (result.setIsEnabled === undefined) {
                        result.setIsEnabled = true;
                    }

//                    $scope.switchLocale('de-de');
                    $scope.lxForm.setModel(result);
                }
            });

            $scope.save = function () {
                transport.emit('api/lib/settings/setUserSettings', $scope.lxForm.model, function (error, result) {
                    if (error) {
                        $scope.item.error = error;
                    } else if (result) {
                        $modalInstance.close($scope.lxForm.model);
                    }
                });
            };

            $scope.cancel = function () {
                if ($modalInstance) {
                    $modalInstance.dismiss('cancel');
                }
            };
        }]);