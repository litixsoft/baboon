'use strict';
angular.module('common.auth', [])
    .controller('CommonAuthLoginCtrl', function ($scope, $bbcForm, $bbcTransport, $translate, $log, $window, $bbcSession, $modal) {
        $scope.$bbcForm = $bbcForm('accountLoginCtrl', '_id'); //login popup form
        $scope.user = {};
        $scope.authFailed = false;
        $scope.authError = false;
        $scope.guestError = false;

        $scope.getUserSettings = function () {
            $bbcTransport.emit('api/settings/getUserSettings', {}, function (error, result) {
                if (result && result.language) {
                    //set language on app start
                    $scope.switchLocale(result.language);
                }
            });
        };

        $scope.getUserSettings();

        /**
         * watch for language changes and save them instantly to the user setting
         */
        $scope.$watch('currentLang', function (newVal, oldValue) {
            if (newVal !== oldValue) {
                $bbcTransport.emit('api/settings/setUserSetting', {key: 'language', value: newVal}, function (error) {
                    if (error) {
                        $log.warn(error);
                    }
                });
            }
        });

        $bbcSession.getUserDataForClient(function (error, result) {
            if (error) {
                $log.warn(error);
            }
            if (result) {
                $scope.userName = result.username;
                $scope.isLoggedIn = result.isLoggedIn;
                $scope.rightSystem = result.rightssystem;
            }
        });

        /**
         * user login from popup form
         */
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

        /**
         * Open the settings modal.
         */
        $scope.editSettings = function () {
            $scope.modalEditSettings = $modal.open({
                backdrop: true, //static, true, false
                modalFade: true,
                controller: 'CommonUserSettingsCtrl',
                keyboard: false,
                templateUrl: 'common/popup_login/popup_settings.html'
            });

            $scope.modalEditSettings.result.then(function () {
                $scope.getUserSettings();
            }, angular.noop);
        };

        /**
         * Open the changePassword modal.
         */
        $scope.changePassword = function () {
            $scope.modalChangePassword = $modal.open({
                backdrop: true, //static, true, false
                modalFade: true,
                controller: 'CommonUserChangePasswordCtrl',
                keyboard: false,
                templateUrl: 'common/popup_login/popup_change_password.html'
            });

            $scope.modalChangePassword.result.then(function () {
                $window.location = '/api/auth/logout';
            }, angular.noop);
        };

    })
    .controller('CommonUserSettingsCtrl', function ($scope, $bbcTransport, $modalInstance, $bbcForm) {
        $scope.lxForm = $bbcForm('settings', '_id');
        $scope.languages = [
            {
                name: 'ENGLISH',
                code: 'en-us',
                flagURL: 'assets/images/flag-usa48.png'
            },
            {
                name: 'GERMAN',
                code: 'de-de',
                flagURL: 'assets/images/flag-germany48.png'
            }
        ];

        $scope.test = [0, 1, 2, 3, 4, 5, 6];
        $scope.item = {};

        $bbcTransport.emit('api/settings/getUserSettings', {}, function (error, result) {
            if (error) {
                $scope.item.error = error;
            } else if (result) {

                if (result.setIsEnabled === undefined) {
                    result.setIsEnabled = true;
                }

                $scope.lxForm.setModel(result);
            }
        });

        $scope.save = function () {
            $bbcTransport.emit('api/settings/setUserSettings', $scope.lxForm.model, function (error, result) {
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
    })
    .controller('CommonUserChangePasswordCtrl', function ($scope, $bbcTransport, $modalInstance, $bbcForm) {
        $scope.bbcForm = $bbcForm('change_password');
        $scope.item = {};

        $scope.save = function () {
            $bbcTransport.emit('api/account/changePassword', $scope.bbcForm.model, function (error, result) {
                if (error) {
                    $scope.item.error = error.message;
                } else if (result) {
                    $modalInstance.close();
                }
            });
        };

        $scope.cancel = function () {
            if ($modalInstance) {
                $modalInstance.dismiss('cancel');
            }
        };
    });