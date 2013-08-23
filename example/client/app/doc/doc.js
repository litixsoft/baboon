/*global angular*/
angular.module('bbdoc', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/doc/md/first', {templateUrl: '/doc/md/first.html'});
        $routeProvider.when('/doc/md/second', {templateUrl: '/doc/md/second.html'});
        $routeProvider.when('/doc/md/third', {templateUrl: '/doc/md/third.html'});
        $routeProvider.when('/doc/md/fourth', {templateUrl: '/doc/md/fourth.html'});
        $routeProvider.when('/doc/md/five', {templateUrl: '/doc/md/five.html'});
        $routeProvider.when('/doc/md/six', {templateUrl: '/doc/md/six.html'});
        $routeProvider.when('/doc/md/seven', {templateUrl: '/doc/md/seven.html'});
        $routeProvider.when('/doc/md/eight', {templateUrl: '/doc/md/eight.html'});
    });
