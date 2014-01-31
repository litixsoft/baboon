'use strict';

angular.module('main.home', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/main/home/home.html',
                controller: 'MainHomeCtrl'
            })
            .when('/home', {
                templateUrl: 'app/main/home/home.html',
                controller: 'MainHomeCtrl'
            });
    })
    .controller('MainHomeCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/main/home/home.html';
        });
    });
