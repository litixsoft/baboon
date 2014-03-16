'use strict';

angular.module('main', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav',
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        'main.home',
        'main.about',
        'main.contact',
        'main.localization',
        'hljs',
        'bbc.transport'
    ])
    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, tmhDynamicLocaleProvider, transportProvider) {

        // Routing and navigation
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        $bbcNavigationProvider.set({
            app: 'main',
            route: '/'
        });

        // transport
        transportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/main/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate, tmhDynamicLocale, $log, $window) {

        $rootScope.requestNeeded = false;

        $rootScope.$on('$translateChangeSuccess', function() {
            tmhDynamicLocale.set($translate.use());
        });

        $rootScope.$on('$routeChangeStart', function (current, next) {

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
    });