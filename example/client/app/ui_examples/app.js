/*global angular*/
angular.module('ui_app', [
        'templates-ui',
        'ui.bootstrap',
        'ui.utils',
        'lx.directives',
        'base',
        'extend',
        'vendor'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });