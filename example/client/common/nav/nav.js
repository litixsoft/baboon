
'use strict';

angular.module('common.nav', [])
    .controller('CommonNavCtrl', function ($scope, $location) {

        $scope.menu = [
            {
                'title': 'Home',
                'link': '/',
                'target': '_self'
            },
            {
                'title': 'About',
                'link': '/about'
            },
            {
                'title': 'Contact',
                'link': '/contact'
            },
            {
                'title': 'Admin',
                'link': '/admin',
                'target': '_self'
            }
        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    });

