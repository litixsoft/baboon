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
            .when('/guide', { templateUrl: 'partials/guide/alert/alert.html', controller: 'ExampleCtrl' })
            .when('/guide/alert', { templateUrl: 'partials/guide/alert/alert.html', controller: 'ExampleCtrl' });

        $routeProvider.otherwise({ redirectTo: '/guide' });

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate, $location) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function(locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

        $rootScope.menu = [
            { 'title': 'bbc.alert', 'link': '/guide/alert' }
        ];

        $rootScope.isActive = function (route) {
            return route === $location.path();
        };


    })
    .controller('ExampleCtrl', function ($scope, $http) {

    });

