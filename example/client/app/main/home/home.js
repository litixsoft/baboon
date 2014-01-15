
'use strict';

angular.module('example.home', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/main/home/home.html',
                controller: 'ExampleHomeCtrl'
            })
            .when('/home', {
                templateUrl: 'app/main/home/home.html',
                controller: 'ExampleHomeCtrl'
            });
    })
    .controller('ExampleHomeCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'main/home/home';
            //
        });
    });