/*global angular*/
angular.module('home', ['home.about'])
    // config home module
    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: '/home/home.html'});
        $routeProvider.when('/home', {templateUrl: '/home/home.html'});
    });