
'use strict';

angular.module('main.about', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/about', {
                templateUrl: 'app/main/about/about.html',
                controller: 'MainAboutCtrl',
                app: 'main'
            });
    })
    .controller('MainAboutCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/main/about/about.html';
        });
    });