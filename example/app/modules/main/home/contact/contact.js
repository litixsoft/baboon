'use strict';

angular.module('main.home.contact', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/main/contact', {
                templateUrl: 'modules/main/home/contact/contact.html',
                controller: 'MainHomeContactCtrl',
                app: 'main'
            });
    })
    .controller('MainHomeContactCtrl', function ($scope) {
        $scope.view = 'contact';
        $scope.controller = 'MainHomeContactCtrl';
    });
