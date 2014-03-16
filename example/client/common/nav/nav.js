'use strict';

angular.module('common.nav', ['bbc.navigation'])
    .controller('CommonNavCtrl', function ($scope, $location, $bbcNavigation) {

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
            return route === $location.path();
        };
    });