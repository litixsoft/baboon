/*global angular*/
angular.module('lx.sort', [])
    .directive('lxSort', function () {
        return {
            restrict: 'E',
            template: '<div><span ng-click="sort()">{{field_title}}</span>' +
                '<i ng-show="sortOpts[field_name] == 1" class="icon-arrow-up"></i>' +
                '<i ng-show="sortOpts[field_name] == -1" class="icon-arrow-down"></i></div>',
            replace: true,
            scope: {
                sortOpts: '=',
                onSorting: '&'
            },
            link: function (scope, element, attrs) {
                scope.field_title = attrs.fieldTitle;
                scope.field_name = attrs.fieldName;
                scope.internalSortDir = 1;

                scope.sort = function () {
                    scope.onSorting({sortingOptions: scope.getOptions()});
                };

                scope.getOptions = function () {
                    if (scope.sortOpts[scope.field_name]) {
                        scope.internalSortDir = scope.internalSortDir === 1 ? -1 : 1;
                    } else {
                        scope.internalSortDir = 1;
                    }

                    var sort = {};
                    sort[scope.field_name] = scope.internalSortDir;

                    return sort;
                };
            }
        };
    });