'use strict';

angular.module('main', [
        'ngRoute',
        'ui.bootstrap',
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        'common.nav',
        'main.home',
        'main.about',
        'main.contact',
        'main.localization',
        'hljs'
    ])
    .config(function ($routeProvider, $locationProvider, navigationProvider, $translateProvider, tmhDynamicLocaleProvider) {
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/main/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
        navigationProvider.setCurrentApp('main');
    })
    .run(function ($rootScope, $translate, tmhDynamicLocale) {
        $rootScope.$on('$translateChangeSuccess', function() {
            tmhDynamicLocale.set($translate.uses());
        });
        
    });