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
            .when('/api', { templateUrl: 'partials/api/' + apiNav[0].link + '.js.html'});


        for (var z = 0; z < apiNav.length; z++) {
            $routeProvider.when('/api/' + apiNav[z].link + '', { templateUrl: 'partials/api/' + apiNav[z].link + '.js.html'});
        }

        $routeProvider.otherwise({ redirectTo: '/api' });

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

        $rootScope.navlist = apiNav;

        $rootScope.activeLink = 0;
//        console.log("RUN");

        $rootScope.setActive = function (id) {
            $rootScope.activeLink = id;
        };
    });

