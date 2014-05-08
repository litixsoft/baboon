'use strict';

angular.module('auth', [
    'ngRoute',
    'ui.bootstrap',
    'bbc.transport',
    'bbc.session',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'bbc.cache',
    'bbc.form'
])
    .config(function ($routeProvider, $locationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {

        // Routing and navigation
        $routeProvider.when('/auth/login', {templateUrl: 'app/auth/login.html', controller: 'AuthLoginCtrl'});
        $routeProvider.otherwise({redirectTo: '/auth/login'});

        $locationProvider.html5Mode(true);

        // Transport
        $bbcTransportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/auth/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .constant('adminModulePath', 'api/app/auth/')
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
    .controller('AuthLoginCtrl', function ($scope, $bbcForm, $timeout) {

        $scope.$bbcForm = $bbcForm('authLoginCtrl', '_id');
        $scope.user = {};
        $scope.authFailed = false;
        $scope.serverError = false;


        $timeout(function () {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            $scope.$bbcForm.populateValidation($scope.form, [
                { property: 'username', message: 'Lastname must be Doe.' }
            ]);

        }, 100);

    });