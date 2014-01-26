'use strict';

angular.module('admin', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl'
            })
            .when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
    })
    .controller('AdminCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/admin/admin.html';
        });
    });
