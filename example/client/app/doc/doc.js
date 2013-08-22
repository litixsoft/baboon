/*global angular*/
angular.module('bbdoc', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/doc/md/first', {templateUrl: '/doc/md/first.html'});
    });
