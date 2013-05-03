/*global angular*/
angular.module('app', ['templates-app', 'templates-common', 'ui.bootstrap', 'lx.directives', 'app.services', 'blog', 'enterprise', 'home'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    });
