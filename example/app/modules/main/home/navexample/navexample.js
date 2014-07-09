'use strict';

angular.module('main.home.navexample', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/main/navexample', {
                templateUrl: 'modules/main/home/navexample/navexample.html',
                controller: 'MainHomeNavexampleCtrl',
                app: 'main'
            });
    })
    .controller('MainHomeNavexampleCtrl', function ($scope) {
        $scope.view = 'Navexample';
        $scope.controller = 'MainHomeNavexampleCtrl';
    });
