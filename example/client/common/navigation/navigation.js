'use strict';

angular.module('common.navigation', ['bbc.navigation'])
    .directive('navigationTop', function($bbcNavigation, $location) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="nav nav-pills">' +
                           '<li ng-repeat="item in menuTopList" ng-class="{active: isActive(item.route)}">' +
                                '<a ng-if="item.target" ng-href="{{item.route}}" target="{{item.target}}">{{item.title | translate }}</a>' +
                                '<a ng-if="!item.target" ng-href="{{item.route}}">{{item.title | translate }}</a>' +
                           '</li>' +
                        '</ul>',
            scope: {
                orientation: '@'
            },
            link: function (scope, element) {
                if(scope.orientation === 'vertical') {
                    element.addClass('nav-stacked');
                }

                $bbcNavigation.getTopList(function (error, navList) {
                    if (error || navList.length === 0) {
                        scope.menuTopList = [];
                    }
                    else {
                        scope.menuTopList = navList;
                    }
                });

                scope.isActive = function (route) {
                    if (route === $bbcNavigation.getRoute()) {
                        return true;
                    }

                    return route === $location.path();
                };
            }
        };
    })
    .directive('navigationSub', function($bbcNavigation, $location) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="nav nav-pills nav-stacked">' +
                           '<li ng-repeat="item in menuSubList" ng-class="{active: isActive(item.route)}">' +
                                '<a ng-if="item.target" ng-href="{{item.route}}" target="{{item.target}}">{{item.title | translate }}</a>' +
                                '<a ng-if="!item.target" ng-href="{{item.route}}">{{item.title | translate }}</a>' +
                           '</li>' +
                      '</ul>',
            scope: {
                orientation: '@'
            },
            link: function (scope, element) {
                if(scope.orientation === 'horizontal') {
                    element.removeClass('nav-stacked');
                }

                $bbcNavigation.getSubList(function (error, navList) {
                    if (error || navList.length === 0) {
                        scope.menuSubList = [];
                    }
                    else {
                        scope.menuSubList = navList;
                    }
                });

                scope.isActive = function (route) {
                    if (route === $bbcNavigation.getRoute()) {
                        return true;
                    }

                    return route === $location.path();
                };
            }
        };
    });