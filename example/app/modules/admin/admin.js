'use strict';

angular.module('admin', [
    'ngRoute',
    'common.navigation',
    'ui.bootstrap',
    'admin.home'
])
    .constant('ACTIVE_APP', 'admin')
    .config(function ($routeProvider, $locationProvider) {

        // Routing and navigation
        $routeProvider.otherwise({redirectTo: '/admin/home'});
        $locationProvider.html5Mode(true);
    });

