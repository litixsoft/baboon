/*global angular*/
angular.module('app', [
        'templates-app',
        'ui.bootstrap',
        'ui.utils',
        'lx.directives',
        'lx.services',
        'app.services',
        'blog',
        'enterprise',
        'home'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
