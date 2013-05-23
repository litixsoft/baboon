/*global angular*/
angular.module('app', [
        'ui.utils',
        'baboon.directives',
        'baboon.services',
        'blog',
        'enterprise',
        'home',
        'cache',
        'login'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
