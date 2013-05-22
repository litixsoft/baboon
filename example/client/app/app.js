/*global angular*/
angular.module('app', [
        'ui.utils',
        'baboon.directives',
        'baboon.services',
        'blog',
        'enterprise',
        'home',
        'cache'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
