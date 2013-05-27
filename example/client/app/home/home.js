/*global angular*/
angular.module('home', ['home.about'])

// config home module
.config(function ($routeProvider) {
    $routeProvider.when('/', {templateUrl: '/home/home.html', controller: 'homeCtrl'});
    $routeProvider.when('/home', {templateUrl: '/home/home.html', controller: 'homeCtrl'});
})
// home controller
.controller('homeCtrl', ['$scope', 'session', function () {}]);