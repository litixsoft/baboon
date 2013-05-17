/*global angular*/
angular.module('ui_app', [
        'templates-ui',
        'ui.utils',
        'lx.directives',
        'base',
        'extend',
        'vendor',
        'ui.calendar',
        'ui.date',
        'ui.codemirror',
        'ui.select2',
        'ui.sortable'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });