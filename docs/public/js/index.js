'use strict';

angular.module('example', [
        'ngRoute',
        'ui.bootstrap',
        'pascalprecht.translate',
        'hljs',
        'bbc.markdown'

    ])
    .config(function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', { templateUrl: 'partials/api/index.html'});

        $routeProvider.otherwise({ redirectTo: '/' });

//        $bbcTransportProvider.set();
//        $bbcNavigationProvider.set({app:'main', route:'home'});
//
        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function(locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

    });

