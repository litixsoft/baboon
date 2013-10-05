/*global angular*/
angular.module('admin.directives', ['template/lxRights/outer.html', 'template/lxRights/inner.html'])
    .directive('lxRights', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                rights: '=',
                onSetRight: '&'
            },
            link: function (scope) {
                scope.toggleShow = function (data) {
                    if (data.hide === 'lxclose' || data.hide === undefined) {
                        data.hide = 'lxopen';
                    } else {
                        data.hide = 'lxclose';
                    }
                };

                scope.toggleNav = function (data) {
                    if (data.hide === '' || data.hide === undefined) {
                        data.hide = 'open';
                    } else {
                        data.hide = '';
                    }
                };
            },
            templateUrl: 'template/lxRights/outer.html'
        };
    });

angular.module('template/lxRights/outer.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/lxRights/outer.html',
        '<ul>\n' +
            '<li ng-repeat="(mod, data) in rights" ng-include="\'template/lxRights/inner.html\'"></li>\n' +
            '</ul>');
}]);

angular.module('template/lxRights/inner.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/lxRights/inner.html',
        '<div class="list-item">\n' +
            '<div class="opensub {{data.hide}}" ng-show="data.children" ng-click="toggleShow(data)"></div>\n' +
            '<span>{{ mod }}</span>\n' +
            '</div>\n' +

            '<div ui-if="!data.children">' +
            '<ul>' +
            '<li ng-repeat="right in data">' +
            '<input type="checkbox" ng-model="right.isSelected" ng-click="onSetRight({right: right})">' +
            '<span>{{ right.displayName }}</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +

            '<ul class="display {{data.hide}}" ui-if="data.children">\n' +
            '<li ng-repeat="(mod, data) in data.children" ng-include="\'template/lxRights/inner.html\'">\n' +
            '</li>\n' +
            '</ul> '
    );
}]);
