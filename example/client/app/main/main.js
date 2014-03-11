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
    .config(function ($routeProvider, $locationProvider, navigationProvider, $translateProvider, tmhDynamicLocaleProvider, transportProvider) {

        // Routing and navigation
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        navigationProvider.setCurrentApp('main');
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
    .run(function ($rootScope, $translate, tmhDynamicLocale) {
        $rootScope.$on('$translateChangeSuccess', function() {
            tmhDynamicLocale.set($translate.use());
        });
    });

