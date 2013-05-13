/*global angular*/
angular.module('ui_app', [
        'templates-ui',
        'ui.bootstrap',
        'lx.directives',
        'base'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
