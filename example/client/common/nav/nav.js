'use strict';

angular.module('common.nav', ['bbc.navigation'])
    .controller('CommonNavCtrl', function ($scope, $location, $bbcNavigation) {

        var appRoute = $bbcNavigation.getRoute();

        $bbcNavigation.getTopList(function (error, navList) {

            if (error || navList.length === 0) {
                $scope.menuTopList = [];
            }
            else {
                $scope.menuTopList = navList;
            }
        });

        $bbcNavigation.getSubList(function (error, navList) {

            if (error || navList.length === 0) {
                $scope.menuSubList = [];
            }
            else {
                $scope.menuSubList = navList;
            }
        });

        $scope.isActive = function (route) {

            if (route === appRoute) {
                return true;
            }

            return route === $location.path();
        };
    });