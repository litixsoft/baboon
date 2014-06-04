'use strict';

angular.module('admin', [
    'ngRoute',
    'ui.bootstrap',
    'bbc.transport',
    'bbc.navigation',
    'bbc.cache',
    'bbc.form',
    'bbc.modal',
    'bbc.pager',
    'bbc.sort',
    'bbc.session',
    'common.auth',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'checklist-model',
    'admin.groups',
    'admin.rights',
    'admin.roles',
    'admin.users'
])
    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {

        $routeProvider.otherwise({redirectTo: '/admin/users'});
        $locationProvider.html5Mode(true);

        $bbcNavigationProvider.set({
            app: 'admin',
            route: '/admin'
        });

        // Transport
        $bbcTransportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/admin/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .constant('adminModulePath', 'api/app/admin/')
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
    });