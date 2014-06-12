'use strict';

angular.module('example', [
        'ngRoute',
//        'ui.bootstrap',
        'pascalprecht.translate',
//        'hljs',
//        'bbc.alert',
//        'bbc.cache',
//        'bbc.checkbox',
//        'bbc.radio',
        'bbc.markdown'//,
//        'bbc.sort',
//        'bbc.inline.edit',
//        'bbc.reset',
//        'bbc.modal',
//        'bbc.datepicker',
//        'bbc.transport',
//        'bbc.integer',
//        'bbc.float',
//        'bbc.form',
//        'bbc.pager',
//        'bbc.navigation',
//        'bbc.session'
    ])
    .config(function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', { templateUrl: 'baboon_04/docs/guide/alert/alert.html', controller: 'ExampleCtrl' })
//            .when('/alert', { templateUrl: 'partials/alert/alert.html', controller: 'AlertCtrl' })
//            .when('/cache', { templateUrl: 'partials/cache/cache.html', controller: 'CacheCtrl' })
//            .when('/checkbox', { templateUrl: 'partials/checkbox/checkbox.html', controller: 'CheckboxCtrl' })
//            .when('/datepicker', { templateUrl: 'partials/datepicker/datepicker.html', controller: 'DatepickerCtrl' })
//            .when('/edit', { templateUrl: 'partials/inlineEdit/inlineEdit.html', controller: 'InlineEditCtrl' })
//            .when('/float', { templateUrl: 'partials/float/float.html', controller: 'FloatCtrl' })
//            .when('/form', { templateUrl: 'partials/form/form.html', controller: 'FormCtrl' })
//            .when('/integer', { templateUrl: 'partials/integer/integer.html', controller: 'IntegerCtrl' })
//            .when('/markdown', { templateUrl: 'partials/markdown/markdown.html', controller: 'MarkdownCtrl' })
//            .when('/modal', { templateUrl: 'partials/modal/modal.html', controller: 'ModalCtrl' })
//            .when('/nav-home', { templateUrl: 'partials/navigation/nav_home.html', controller: 'NavHomeCtrl' })
//            .when('/nav-home/nav-products', { templateUrl: 'partials/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/nav-home/nav-customers', { templateUrl: 'partials/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/nav-home/nav-statistics', { templateUrl: 'partials/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/nav-admin', { templateUrl: 'partials/navigation/nav_admin.html', controller: 'NavAdminCtrl' })
//            .when('/nav-admin/nav-rights', { templateUrl: 'partials/navigation/nav_admin.html', controller: 'NavAdminCtrl' })
//            .when('/nav-admin/nav-groups', { templateUrl: 'partials/navigation/nav_admin.html', controller: 'NavAdminCtrl' })
//            .when('/nav-admin/nav-users', { templateUrl: 'partials/navigation/nav_admin.html', controller: 'NavAdminCtrl' })
//            .when('/pager', { templateUrl: 'partials/pager/pager.html', controller: 'PagerCtrl' })
//            .when('/radio', { templateUrl: 'partials/radio/radio.html', controller: 'RadioCtrl' })
//            .when('/reset', { templateUrl: 'partials/reset/reset.html', controller: 'ResetCtrl' })
//            .when('/session', { templateUrl: 'partials/session/session.html', controller: 'SessionCtrl' })
//            .when('/sort', { templateUrl: 'partials/sort/sort.html', controller: 'SortCtrl' })
//            .when('/transport', { templateUrl: 'partials/transport/transport.html', controller: 'TransportCtrl' })
            .otherwise({ redirectTo: '/' });

//        $bbcTransportProvider.set();
//        $bbcNavigationProvider.set({app:'main', route:'home'});
//
        $translateProvider.useStaticFilesLoader({
            prefix: 'baboon_04/example/client/locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
//    .run(function ($rootScope, $translate) {
//
//        $rootScope.currentLang = $translate.preferredLanguage();
//
//        $rootScope.switchLocale = function(locale) {
//            $translate.use(locale);
//            $rootScope.currentLang = locale;
//        };
//    })
    .controller('ExampleCtrl', function ($scope) {
        $scope.view = 'partials/example.html';
    })
    .controller('NavigationCtrl', function ($scope, $location) {
        $scope.menu = [
            { 'title': 'Home', 'link': '/' },
            { 'title': 'bbc.alert', 'link': '/alert' },
            { 'title': 'bbc.cache', 'link': '/cache' },
            { 'title': 'bbc.checkbox', 'link': '/checkbox' },
            { 'title': 'bbc.datepicker', 'link': '/datepicker' },
            { 'title': 'bbc.float', 'link': '/float' },
            { 'title': 'bbc.form', 'link': '/form' },
            { 'title': 'bbc.inline.edit', 'link': '/edit' },
            { 'title': 'bbc.integer', 'link': '/integer' },
            { 'title': 'bbc.markdown', 'link': '/markdown' },
            { 'title': 'bbc.modal', 'link': '/modal' },
            { 'title': 'bbc.navigation', 'link': '/nav-home' },
            { 'title': 'bbc.pager', 'link': '/pager' },
            { 'title': 'bbc.radio', 'link': '/radio' },
            { 'title': 'bbc.reset', 'link': '/reset' },
            { 'title': 'bbc.session', 'link': '/session' },
            { 'title': 'bbc.sort', 'link': '/sort' },
            { 'title': 'bbc.transport', 'link': '/transport' }
        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    })
    .controller('AlertCtrl', function ($scope, $bbcAlert) {
        $scope.bbcAlert = $bbcAlert;
        $scope.showAlert = function(type) {
            $scope.bbcAlert[type]('Info message from controller');
        };
    });
