'use strict';

angular.module('common.nav', ['bbc.nav'])
    .controller('CommonNavCtrl', function ($scope, $location, navigation) {

        navigation.getTopList(function (error, navList) {

            if (error || navList.length === 0) {
                $scope.menuTopList = [];
            }
            else {
                $scope.menuTopList = navList;
            }
        });

        navigation.getSubList($location.path(), function (error, navList) {

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