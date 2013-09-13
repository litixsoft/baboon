/*global angular*/
angular.module('baboon.nav.directives',['baboon.nav.tpl/lxnavbar/outer.html', 'baboon.nav.tpl/lxnavbar/inner.html', 'baboon.nav.tpl/lxtreeview/outer.html', 'baboon.nav.tpl/lxtreeview/inner.html'])
    .directive('lxtreeview', function () {
        return {
            restrict: 'E',
            controller: 'LxTreeViewCtrl',
            transclude: false,
            replace: true,
            scope: {
                iconAttr: '@',
                itemlistAttr: '=',
                labelAttr: '@',
                linkAttr: '@',
                ngModel: '@',
                templateAttr: '@',
                methodAttr: '&'
            },
            templateUrl: 'baboon.nav.tpl/lxtreeview/outer.html'
//        templateUrl: 'baboon.nav.tpl/#{attr.templateAttr}/outer.html'
        };
    })
    .directive('lxbootnav', function () {
        return {
            restrict: 'E',
            controller: 'LxTreeViewCtrl',
            transclude: false,
            replace: true,
            scope: {
                iconAttr: '@',
                itemlistAttr: '=',
                labelAttr: '@',
                linkAttr: '@',
                typeAttr: '@',
                ngModel: '@'
            },
            templateUrl: 'baboon.nav.tpl/lxnavbar/outer.html'
        };
    });