/*global angular*/
angular.module('lx.auth', ['lx.auth.services', 'lx.auth.directives', 'lx/auth/tpls/register.html', 'lx/auth/tpls/forget.html'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/auth/register', {templateUrl: 'lx/auth/tpls/register.html', controller: 'lxAuthRegisterCtrl'});
        $routeProvider.when('/auth/forget', {templateUrl: 'lx/auth/tpls/forget.html', controller: 'lxAuthForgotCtrl'});
        $routeProvider.when('/auth/login', {templateUrl: 'lx/auth/tpls/auth_view_login.html', controller: 'lxAuthViewLoginCtrl'});
    }])
    .controller('lxAuthLoginCtrl', ['$scope', '$window', 'lxAuth', function ($scope, $window, lxAuth) {
        var window = angular.element($window);

        lxAuth.getAuthData(function (result) {
            $scope.user = result.username;
            $scope.isAuth = result.isAuth;
        });

        $scope.$watch('openMenu', function (newval) {
            if (newval) {
                window.bind('keydown', function (ev) {
                    if (ev.which === 27) { //ESC Key
                        $scope.$apply(function () {
                            $scope.openMenu = false;
                        });
                    }
                });
            } else {
                window.unbind('keydown');
            }
        });

        $scope.authFailed = false;
        $scope.serverError = false;
        $scope.openMenu = false;

        $scope.login = function () {

            lxAuth.login($scope.username, $scope.password, function (error, result) {
                if (result && !error) {
                    $window.location.reload();
                }
                else {
                    if (error === 403 || error === 401) {
                        $scope.authFailed = true;
                    }
                    else {
                        $scope.serverError = true;
                    }
                }
            });
        };

        $scope.$watch('username', function () {
            if ($scope.authFailed) {
                $scope.authFailed = false;
            }
        });

        $scope.$watch('password', function () {
            if ($scope.authFailed) {
                $scope.authFailed = false;
            }
        });
    }])
    .controller('lxAuthViewLoginCtrl', ['$scope', 'lxForm', 'lxAuth', '$window', '$log',
        function ($scope, lxForm, lxAuth, $window, $log) {
            $scope.lxForm = lxForm('authViewLoginCtrl', '_id');
            $scope.person = {};

            $scope.login = function () {

                lxAuth.login($scope.person.username, $scope.person.password, function (error, result) {
                    if (result && !error) {
                        $window.location.href = '/';
                    }
                    else {
                        if (error === 403 || error === 401) {
                            $log.error('Error ' + error + ' auth Failed!');
                        }
                        else {
                            $log.error('Error ' + error + ' internal server error!');
                        }
                    }
                });
            };
        }])
    .controller('lxAuthRegisterCtrl', ['$scope', 'lxAuth', '$log', function ($scope, lxAuth, $log) {

        $scope.user = {};

        $scope.register = function () {

            lxAuth.register($scope.user, function (error, result) {
                if (error) {
                    $log.error(error);
                }
                else {
                    $log.info(result);
                }
            });
        };
    }])
    .controller('lxAuthForgotCtrl', ['$scope', 'lxAuth', '$log', function ($scope, lxAuth, $log) {

        $scope.createNewPassword = function () {

            var data = {
                email: $scope.email,
                forgotPassword: $scope.forgotPassword,
                forgotUsername: $scope.forgotUsername
            };

            lxAuth.createNewPassword(data, function (error, result) {
                if (error) {
                    $log.error(error);
                }
                else {
                    $log.info(result);
                }
            });
        };
    }]);