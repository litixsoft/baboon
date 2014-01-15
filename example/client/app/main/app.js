'use strict';

angular.module('example', [
        'ngRoute',
        'common.nav',
        'example.home',
        'example.about',
        'example.contact'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
    })
    .run(function run() {
        // your code here
    });