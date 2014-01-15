
'use strict';

angular.module('example.contact', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/contact', {
                templateUrl: 'app/main/contact/contact.html',
                controller: 'ExampleContactCtrl'
            });
    })
    .controller('ExampleContactCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'main/contact/contact';
        });
    });