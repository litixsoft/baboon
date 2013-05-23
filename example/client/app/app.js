/*global angular*/
angular.module('app', [
        'ui.utils',
        'baboon.directives',
        'baboon.services',
        'blog',
        'enterprise',
        'home',
        'login'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
