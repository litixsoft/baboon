'use strict';

angular.module('admin', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav'
    ])
    .config(function ($routeProvider, $locationProvider, navigationProvider) {
        $routeProvider
            .when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl',
                app: 'admin'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
        navigationProvider.setCurrentApp('admin');
    })
    .controller('AdminCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/admin/admin.html';
        });
    });
