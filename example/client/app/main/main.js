'use strict';

angular.module('main', [
        'ngRoute',
        'ui.bootstrap',
        'bbc.transport',
        'bbc.navigation',
        'bbc.session',
        'bbc.form',
        'bbc.cache',
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        'main.home',
        'main.about',
        'main.contact',
        'main.localization',
        'main.session',
        'hljs'
    ])
    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, tmhDynamicLocaleProvider, $bbcTransportProvider) {

        // Routing and navigation
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        $bbcNavigationProvider.set({
            app: 'main',
            route: '/'
        });

        // transport
        $bbcTransportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/main/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate, tmhDynamicLocale, $log, $window, $bbcSession, $bbcTransport) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function(locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

        $rootScope.requestNeeded = false;

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
        $rootScope.$on('$sessionInactive', function() {
            $log.warn('next route change event triggers a server request.');
            $rootScope.requestNeeded = true;
        });

        // translate
        $rootScope.$on('$translateChangeSuccess', function() {
            tmhDynamicLocale.set($translate.use());
        });


//        $rootScope.login = function(){
//            console.log("LOGIN");
//        };
//        $bbcSession.setData('config',{name: 'toll'},function(error,result){
//            console.log(error);
//            console.log(result);
//        });
//        $bbcSession.getData('config',function(error,result){
//            console.log(error);
//            console.log(result.config.name);
//        });

        $bbcSession.getUserDataForClient(function(error,result){
            console.log("result: ",result);
        });
    });
//.controller('AccountLoginCtrl', function ($scope, $bbcForm, $bbcTransport, $translate, $log, $window) {
//
//        $scope.$bbcForm = $bbcForm('accountLoginCtrl', '_id');
//        $scope.user = {};
//        $scope.authFailed = false;
//        $scope.authError = false;
//        $scope.guestError = false;
//
//        $scope.login = function () {
////
////            if ($scope.form) {
////                $scope.form.errors = {};
////            }
////
////            $bbcTransport.rest('api/auth/login', {user: $scope.user}, function (error, result) {
////
////                if (!error && result) {
////                    $window.location.href = '/';
////                }
////                else {
////
////                    if (error.status === 403) {
////                        $scope.authFailed = true;
////                    }
////                    else if (error.status === 400) {
////                        $scope.guestError = true;
////                    }
////                    else {
////                        $scope.authError = true;
////                    }
////
////                    $log.error(error);
////                }
////            });
//        };
//    })