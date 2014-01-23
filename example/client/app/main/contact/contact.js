
'use strict';

angular.module('main.contact', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/contact', {
                templateUrl: 'app/main/contact/contact.html',
                controller: 'MainContactCtrl'
            });
    })
    .controller('MainContactCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/main/contact/contact.html';
        });
    });