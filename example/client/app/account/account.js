'use strict';

angular.module('account', [
    'ngRoute',
    'ui.bootstrap',
    'bbc.transport',
    'bbc.session',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'bbc.cache',
    'bbc.form',
    'bbc.match'
])
    .config(function ($routeProvider, $locationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {

        // Routing and navigation
        $routeProvider.when('/account/login', {templateUrl: 'app/account/login.html', controller: 'AccountLoginCtrl'});
        $routeProvider.when('/account/register', {templateUrl: 'app/account/register.html', controller: 'AccountRegisterCtrl'});
        $routeProvider.when('/account/username', {templateUrl: 'app/account/username.html', controller: 'AccountUsernameCtrl'});
        $routeProvider.when('/account/password', {templateUrl: 'app/account/password.html', controller: 'AccountPasswordCtrl'});
        $routeProvider.otherwise({redirectTo: '/account/login'});

        $locationProvider.html5Mode(true);

        // Transport
        $bbcTransportProvider.set({useSocket: false});

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/account/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate, tmhDynamicLocale, $log, $window, $bbcSession) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function (locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

        // flag for needed request by next route change event
        $rootScope.requestNeeded = false;

        // route change event
        $rootScope.$on('$routeChangeStart', function (current, next) {

            // set activity and check session
            $bbcSession.setActivity(function (error) {

                // check session activity error
                if (error) {
                    $log.warn(error);
                    $rootScope.$emit('$sessionInactive');
                }
            });

            // when request needed is true than make a request with next route
            if ($rootScope.requestNeeded) {
                $window.location.assign(next.$$route.originalPath);
            }
        });

        // session inactive event, triggered when session inactive or lost
        $rootScope.$on('$sessionInactive', function () {
            $log.warn('next route change event triggers a server request.');
            $rootScope.requestNeeded = true;
        });

        // translate
        $rootScope.$on('$translateChangeSuccess', function () {
            tmhDynamicLocale.set($translate.use());
        });
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
    })
    .controller('AccountRegisterCtrl', function ($scope, $bbcTransport, $translate) {
        $scope.alerts = [];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.register = function () {
            if ($scope.form && !$scope.form.$valid) {
                return;
            }

            if ($scope.form) {
                $scope.form.errors = {};
            }

            $scope.user.language = $translate.use();

            $bbcTransport.emit('api/account/register', $scope.user, function (error, result) {
                $scope.alerts.length = 0;

                if (!error && result) {
                    $scope.alerts.push({ type: 'success', msg: 'REGISTER_MSG' });
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
    })
    .controller('AccountUsernameCtrl', function ($scope, $bbcTransport, $translate) {
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

            $bbcTransport.emit('api/account/forgotUsername', $scope.user, function (error, result) {
                $scope.alerts.length = 0;

                if (!error && result) {
                    $scope.alerts.push({ type: 'success', msg: 'USERNAME_MSG' });
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
