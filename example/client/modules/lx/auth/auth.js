/*global angular*/
angular.module('lx.auth', ['lx.auth.services', 'lx.auth.directives', 'lx/auth/tpls/register.html', 'lx/auth/tpls/forget.html'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/auth/register', {templateUrl: 'lx/auth/tpls/register.html', controller: 'lxAuthRegisterCtrl'});
        $routeProvider.when('/auth/forget', {templateUrl: 'lx/auth/tpls/forget.html', controller: 'lxAuthForgotCtrl'});
        $routeProvider.when('/login', {templateUrl: 'lx/auth/tpls/auth_view_login.html', controller: 'lxAuthViewLoginCtrl'});
        $routeProvider.when('/auth/activate:userid', {templateUrl: 'lx/auth/tpls/activate.html', controller: 'lxAuthActivateCtrl'});
        $routeProvider.when('/auth/forget:userid', {templateUrl: 'lx/auth/tpls/reset.html', controller: 'lxAuthResetCtrl'});
    }])
    .controller('lxAuthLoginCtrl', ['$scope', '$window', 'lxAuth', function ($scope, $window, lxAuth) {
        var window = angular.element($window);

        lxAuth.getAuthData(function (result) {
            $scope.user = result.name;
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

        $scope.closePopupOnAction = function () {
            $scope.openMenu = false;
        };
    }])
    .controller('lxAuthViewLoginCtrl', ['$scope', 'lxForm', 'lxAuth', '$window', '$log', function ($scope, lxForm, lxAuth, $window, $log) {

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
                        if(error.validation){
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
    }])
    .controller('lxAuthRegisterCtrl', ['$scope', 'lxAuth', '$log', '$location', 'lxForm', function ($scope, lxAuth, $log, $location, lxForm) {

        var lxAlert = $scope.lxAlert;

        $scope.lxForm = lxForm('registerForm', '_id');
        $scope.user = {};

        $scope.register = function () {

            if ($scope.registerForm) {
                $scope.registerForm.errors = {};
            }

            lxAuth.register($scope.user, function (error, result) {
//
                if (result) {
                    $log.info(result);
                    lxAlert.success('User '+$scope.user.name+' erfolgreich registriert. Eine Benachrichtigungs-Email wurde Ihnen zugesendet.');
                    $location.path('/');
                }
                else if (error) {
                    $log.error(error);
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.registerForm, error.validation);
                    } else {
                        lxAlert.success('Fehler: '+error);
                    }
                }

            });
        };
    }])
    .controller('lxAuthActivateCtrl', ['$scope', 'lxAuth', 'lxTransport', '$routeParams', '$location', function ($scope, lxAuth, transport, $routeParams,$location) {

        var lxAlert = $scope.lxAlert;

        $scope.message= '';

        lxAuth.activate({guid: $routeParams.userid}, function(error, result){
            if(error){
                $scope.message = error;
            } else {
                if(result){
                    lxAlert.success('Ihr Account wurde erfolgreich aktiviert. Bitte loggen Sie sich nun ein.');
                    $location.path('/');
                }
            }
        });

    }])
    .controller('lxAuthForgotCtrl', ['$scope', 'lxAuth', '$log', 'lxForm','$location', function ($scope, lxAuth, $log, lxForm, $location) {

        var lxAlert = $scope.lxAlert;

        $scope.lxForm = lxForm('newPasswordForm', '_id');
        $scope.user = {};

        $scope.resetForm = function () {
            console.log("reset");
          $scope.newPasswordForm.$setPristine();
        };

        $scope.serverError = false;

        $scope.createNewPassword = function () {

            if ($scope.newPasswordForm) {
                $scope.newPasswordForm.errors = {};
            }

            var data = {
                email: $scope.user.email,
                forgot: $scope.user.forgot,
                username: $scope.user.username,
                password: $scope.user.password
            };

//            lxAuth.createNewPassword(data, function (error, result) {
            lxAuth.forgetPassword(data, function (error, result) {

                if (result) {
                    $log.info(result);
                    lxAlert.success('Um ihr Passwort zurückzusetzen wurde ihnen eine Bestätigungs-Email zugesand.');
                    $location.path('/');
                }
                else if (error) {
                    $log.error(error);
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.newPasswordForm, error.validation);
                    } else {
                        $scope.serverError = true;
                        $scope.errorMsg = 'Fehler: '+error;
                    }
                }
            });
        };
    }])
    .controller('lxAuthResetCtrl', ['$scope', 'lxAuth', 'lxForm', '$routeParams','$log','$location', function ($scope, lxAuth, lxForm, $routeParams, $log, $location) {

        var lxAlert = $scope.lxAlert;

        $scope.lxForm = lxForm('newPasswordForm', '_id');
        $scope.user = {};

        $scope.resetPassword = function () {

            if ($scope.registerForm) {
                $scope.registerForm.errors = {};
            }

            var data = {
                guid: $routeParams.userid,
                password: $scope.user.password,
                confirmedPassword: $scope.user.confirmedPassword
            };

            lxAuth.resetPassword(data, function(error,result){
                if (result) {
                    $log.info(result);
                    lxAlert.success('Ihr Passwort wurde erfolgreich geändert. Bitte loggen Sie sich nun ein.');
                    $location.path('/');
                }
                else if (error) {
                    $log.error(error);
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.resetForm, error.validation);
                    } else {
                        $scope.message = error;
                        //lxAlert.success('Fehler: '+error);
                    }
                }
            });

        };
    }]);