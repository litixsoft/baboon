'use strict';

angular.module('common.navigation', ['bbc.navigation'])
    .directive('navigationList', function($bbcNavigation, $location) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="nav nav-pills nav-stacked">' +
                          '<li ng-repeat="item in navList" ng-class="{active: isActive(item.route)}">' +
                              '<a ng-if="item.target" ng-href="{{item.route}}" target="{{item.target}}">{{item.title | translate }}</a>' +
                              '<a ng-if="!item.target" ng-href="{{item.route}}">{{item.title | translate }}</a>' +
                          '</li>' +
                      '</ul>',
            scope: {
                orientation: '@'
            },
            link: function (scope, element, attrs) {
                if(attrs.type !== 'top' && attrs.type !== 'sub' && attrs.type !== 'list') {
                    throw new Error('Type must be top, sub or list.');
                }

                var defaults = {
                    top: { fn: 'getTopList', orientation: 'horizontal' },
                    sub: { fn: 'getSubList', orientation: 'vertical' },
                    list: { fn: 'getList', orientation: 'vertical' }
                };

                var fn = defaults[attrs.type].fn;
                var orientation = scope.orientation || defaults[attrs.type].orientation;

                element.toggleClass('nav-stacked', orientation === 'vertical');

                $bbcNavigation[fn](function (error, navList) {
                    if (error || navList.length === 0) {
                        scope.navList = [];
                    }
                    else {
                        scope.navList = navList;
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
;