angular.module('home', ['home.about'])

// config home module
.config(function ($routeProvider) {
    $routeProvider.when('/home', {templateUrl: 'home/views/home.html', controller: 'homeCtrl'});
})
// home controller
.controller('homeCtrl', ['$scope', function () {}]);