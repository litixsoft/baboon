'use strict';

angular.module('main', [
    'ngRoute',
    'common.navigation',
    'ui.bootstrap',
    'main.home'
])
    .constant('ACTIVE_APP', 'main')
    .config(function ($routeProvider, $locationProvider) {

        // Routing and navigation
        $routeProvider.otherwise({redirectTo: '/main/home'});
        $locationProvider.html5Mode(true);

    });