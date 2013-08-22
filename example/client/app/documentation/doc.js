angular.module('bbdoc', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/doc/md/first', {templateUrl: '/documentation/md/first.html'});
    });