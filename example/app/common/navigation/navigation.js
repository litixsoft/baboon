'use strict';

angular.module('common.navigation', [])
    .constant('NAVOBJ', {
        standard: [
            {
                'title': 'Main',
                'app': 'main',
                'children': [
                    {
                        'title': 'Home',
                        'route': '/main/home',
                        'app': 'main'
                    },
                    {
                        'title': 'Navigation Examples',
                        'route': '/main/navexample',
                        'app': 'main'
                    },
                    {
                        'title': 'About',
                        'route': '/main/about',
                        'app': 'main'
                    },
                    {
                        'title': 'Contact',
                        'route': '/main/contact',
                        'app': 'main'
                    }
                ]
            },
            {
                'title': 'Admin',
                'route': '/admin/home',
                'app': 'admin'
            }
        ],
        footer: [
            {
                'title': 'About',
                'route': '/main/about',
                'app': 'main',
                'children': [
                    {
                        'title': 'Home',
                        'route': '/main/home',
                        'app': 'main'
                    }
                ]
            },
            {
                'title': 'Contact',
                'route': '/main/contact',
                'app': 'main'
            }
        ],
        toplevel: [
            {
                'title': 'Home',
                'route': '/main/home',
                'app': 'main'
            },
            {
                'title': 'Admin',
                'route': '/admin/home',
                'app': 'admin'
            }
        ]
    })
    .directive('comNav', function ($location, ACTIVE_APP, NAVOBJ) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="nav nav-pills">' +
                '<li ng-repeat="item in menu" ng-class="{active: isActive(item.route)}">' +
                '<a ng-href="{{item.route}}" ng-show="isActiveApp(item.app)">{{item.title}}</a>' +
                '<a ng-href="{{item.route}}" target="_self" ng-show="!isActiveApp(item.app)">{{item.title}}</a>' +
                '</li>' +
                '</ul>',

            scope: {
                orientation: '@',
                navLinklist: '@'
            },
            link: function (scope, element) {

                var orientation = scope.orientation || 'horizontal';
                element.toggleClass('nav-stacked', orientation === 'vertical');

                scope.menu = NAVOBJ[scope.navLinklist || 'standard'];

                scope.isActiveApp = function (app) {
                    return app === ACTIVE_APP;
                };

                scope.isActive = function (route) {
                    return route === $location.path();
                };
            }
        };
    })
    .directive('comNavTree', function ($location, $templateCache, ACTIVE_APP, NAVOBJ) {
        return {
            restrict: 'E',
            replace: true,
            template: '<ul class="navlist">' +
                '<li ng-repeat="data in navList"  ng-include="\'bbc/navigation/tpls/treeview/inner.html\'"></li>' +
                '</ul>',
            scope: {
                navLinklist: '@'
            },
            link: function (scope) {

                $templateCache.put('bbc/navigation/tpls/treeview/inner.html',
                        '<div class="list-item" ng-class="{active: isActive(data.route)}">' +
                        '<div class="opensub {{data.hide}}" ng-show="data.children" ng-click="toggleShow(data)"></div>' +
                        '<div class="nav-icon {{data.icon}}"></div>' +
                        '<a ng-if="data.route && isActiveApp(data.app)" ng-class="{spacer: data.children.length > 0}" ng-href="{{data.route}}"><span>{{data.title}}</span></a>' +
                        '<a ng-if="data.route && !isActiveApp(data.app)" ng-class="{spacer: data.children.length > 0}" ng-href="{{data.route}}" target="_self"><span>{{data.title}}</span></a>' +
                        '<a ng-if="!data.route" ng-class="{spacer: data.children.length > 0}" ng-click="toggleShow(data);" style="cursor:pointer;"><span>{{data.title}}</span></a>' +
                        '</div>' +
                        '<ul class="display {{data.hide}}" ng-if="data.children.length">' +
                        '<li ng-repeat="data in data.children" ng-include="\'bbc/navigation/tpls/treeview/inner.html\'"></li>' +
                        '</ul>');


                scope.app = ACTIVE_APP;


                scope.openAll = function (list) {
                    var found = false;
                    angular.forEach(list, function (value) {
                        if (value.children) {
                            var openLink = scope.openAll(value.children);
                            if (openLink) {
                                value.hide = 'nav-open';
                            }
                        }
                        if (value.route === $location.path()) {
                            found = true;
                        }
                    });
                    return found;
                };

                scope.toggleShow = function (data) {
                    if (data.hide === 'nav-close' || data.hide === undefined) {
                        data.hide = 'nav-open';
                    } else {
                        data.hide = 'nav-close';
                    }
                };

                scope.isActive = function (route) {
                    return route === $location.path();
                };

                scope.isActiveApp = function (app) {
                    return app === ACTIVE_APP;
                };


                scope.navList = NAVOBJ[scope.navLinklist || 'standard'];
                if (scope.navList.length !== 0) {
                    angular.forEach(scope.navList, function (value) {
                        if (value.app === scope.app) {
                            value.hide = 'nav-open';
                        }
                    });
                    scope.openAll(scope.navList);
                }
            }
        };
    });
