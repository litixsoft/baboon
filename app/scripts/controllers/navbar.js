'use strict';

angular.module('app')
    .controller('NavbarCtrl', function ($scope, $location) {
        $scope.menu = [
            {
                'title': 'Home',
                'link': '/'
            },
            {
                'title': 'About',
                'link': '/about'
            },
            {
                'title': 'Contact',
                'link': '/contact'
            }
        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    });
