'use strict';

angular.module('main', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav',
        'main.home',
        'main.about',
        'main.contact'
    ])
    .config(function ($routeProvider, $locationProvider, navigationProvider) {
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
        navigationProvider.setCurrentApp('main');
    });