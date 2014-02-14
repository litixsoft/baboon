/*global angular*/
angular.module('app.settings', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/settings', {templateUrl: 'settings/settings.html', controller: 'settingsCtrl'});
    })
    .constant('settings.modulePath', 'app/settings/')
    .controller('settingsCtrl', ['$scope', 'lxTransport', 'settings.modulePath',
        function ($scope, transport, modulePath) {
            var lxAlert = $scope.lxAlert;
            $scope.allUserSettings = {};
            $scope.userSetting = {};

            $scope.getUserSettings = function () {
                transport.emit(modulePath + 'settings/getUserSettings', {}, function (error, result) {
                    if (error) {
                        lxAlert.error(error);
                    } else if (result) {
                        $scope.allUserSettings = result;
                    }
                });
            };

            $scope.addUserSetting = function () {
                transport.emit(modulePath + 'settings/addUserSetting', $scope.userSetting, function (error, result) {
                    if (error) {
                        lxAlert.error(error);
                    } else if (result) {
                        $scope.userSetting = {};
                        $scope.getUserSettings();
                    }
                });
            };

            $scope.addTestSettings = function () {
                transport.emit(modulePath + 'settings/generateTestSettings', $scope.userSetting, function (error, result) {
                    if (error) {
                        lxAlert.error(error);
                    } else if (result) {
                        $scope.userSetting = {};
                        $scope.getUserSettings();
                    }
                });
            };

            $scope.clearLog = function() {
                $scope.allUserSettings = {};
            };
        }]);