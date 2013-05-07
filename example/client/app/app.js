/*global angular*/
angular.module('app', ['templates-app', 'templates-common','ui.utils','ui.bootstrap','ui.codemirror','ui.date','ui.select2','ui.calendar', 'lx.directives', 'app.services',
        'ui_examples', 'blog', 'enterprise', 'home'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
