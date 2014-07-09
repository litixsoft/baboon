'use strict';

angular.module('main.home.about', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/main/about', {
                templateUrl: 'modules/main/home/about/about.html',
                controller: 'MainHomeAboutCtrl',
                app: 'main'
            });
    })
    .controller('MainHomeAboutCtrl', function ($scope) {
        $scope.view = 'about';
        $scope.controller = 'MainHomeAboutCtrl';
    });
