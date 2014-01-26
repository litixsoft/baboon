'use strict';

angular.module('project1', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav'
    ])
    .config(function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/projects/project1', {
                templateUrl: 'app/projects/project1/project1.html',
                controller: 'Project1Ctrl'
            })
            .otherwise({
                redirectTo: '/projects/project1'
            });

        $locationProvider.html5Mode(true);
    })
    .controller('Project1Ctrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/projects/project1/project1.html';
        });
    });