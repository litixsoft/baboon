'use strict';

angular.module('app', [
        'ngRoute'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/main',
                controller: 'MainCtrl'
            })
            .when('/about', {
                templateUrl: 'partials/about',
                controller: 'AboutCtrl'
            })
            .when('/contact', {
                templateUrl: 'partials/contact',
                controller: 'ContactCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    });