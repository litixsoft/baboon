/*global angular */
angular.module('baboon.directives', [])
    .directive('lxPager', function () {
        return {
            restrict: 'E',
            template: '<div class="btn-group">' +
                '<div class="input-prepend input-append">' +
                '<button class="btn" ng-click="firstPage()" ng-disabled="currentPage == 1">' +
                '<i class="icon-step-backward"></i></button>' +
                '<button class="btn" ng-click="previousPage()" ng-disabled="currentPage == 1">' +
                '<i class="icon-backward"></i></button>' +
                '<input type="text" ng-model="currentPage" style="width: 30px;">' +
                '<button class="btn">of {{numberOfPages()}}</button>' +
                '<button class="btn" ng-click="nextPage()" ng-disabled="currentPage == numberOfPages()">' +
                '<i class="icon-forward"></i></button>' +
                '<button class="btn" ng-click="lastPage()" ng-disabled="currentPage == numberOfPages()">' +
                '<i class="icon-step-forward"></i></button>' +
                '<select ng-model="pageSize" ng-options="p for p in pageSizeOptions" style="width: 70px;"></select>' +
                '<button class="btn">{{count}} items</button>' +
                '</div>' +
                '</div>',
            replace: true,
            scope: {
                count: '=',
                currentPage: '=',
                onPaging: '&'
            },
            link: function (scope, element, attrs) {
                scope.currentPage = 1;
                scope.count = 0;
                scope.pageSize = 5;
                scope.pageSizeOptions = [1, 5, 10, 25, 100];

                // get page size options from attrs
                attrs.$observe('pageSizes', function (value) {
                    var options = scope.$eval(value);

                    if (angular.isArray(options) && options.length > 0 && typeof options[0] === 'number') {
                        scope.pageSizeOptions = options;
                    }
                });

                scope.refresh = function () {
                    scope.onPaging({pagingOptions: scope.getOptions()});
                };

                scope.skip = function () {
                    return (scope.currentPage - 1) * scope.pageSize;
                };

                scope.numberOfPages = function () {
                    if (scope.pageSize < 1) {
                        scope.pageSize = 1;
                    }

                    return Math.ceil(scope.count / scope.pageSize);
                };

                scope.getOptions = function () {
                    return {
                        limit: scope.pageSize,
                        skip: scope.skip()
                    };
                };

                scope.nextPage = function () {
                    var currentPage = scope.currentPage;
                    var count = currentPage * scope.pageSize;

                    if (count < scope.count) {
                        scope.currentPage = ++currentPage;
                    }
                };

                scope.previousPage = function () {
                    var currentPage = scope.currentPage;

                    if (currentPage !== 1) {
                        scope.currentPage = --currentPage;
                    }
                };

                scope.firstPage = function () {
                    scope.currentPage = 1;
                };

                scope.lastPage = function () {
                    scope.currentPage = scope.numberOfPages() || 1;
                };

                scope.$watch('currentPage', function () {
                    scope.refresh();
                });

                scope.$watch('count', function () {
                    // refesh data when current page is greater than number of pages
                    if (scope.currentPage > scope.numberOfPages() && scope.numberOfPages() > 0) {
                        scope.currentPage = scope.numberOfPages() || 1;
                    }
                });

                scope.$watch('pageSize', function () {
                    // set current page to number of pages when current page is greater than number of pages
                    if (scope.currentPage > scope.numberOfPages()) {
                        scope.currentPage = scope.numberOfPages() || 1;
                    } else {
                        scope.refresh();
                    }
                });
            }
        };
    })
    .directive('lxSortField', function () {
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
                    if(scope.sortOpts[scope.field_name]){
                        scope.internalSortDir = scope.internalSortDir === 1 ? -1 : 1;
                    }else{
                        scope.internalSortDir = 1;
                    }

                    var sort = {};
                    sort[scope.field_name] = scope.internalSortDir;

                    return sort;
                };
            }
        };
    })
    .directive('integer', function () {
        var INTEGER_REGEXP = /^\-?\d*$/;

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (INTEGER_REGEXP.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('integer', true);

                        return parseInt(viewValue, 10);
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('integer', false);

                        return undefined;
                    }
                });
            }
        };
    })
    .directive('smartFloat', function () {
        var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (FLOAT_REGEXP.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('float', true);

                        return typeof viewValue === 'number' ? viewValue : parseFloat(viewValue.replace(',', '.'));
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('float', false);

                        return undefined;
                    }
                });

                ctrl.$formatters.unshift(function (modelValue) {
                    if (modelValue) {
                        modelValue = modelValue.toFixed(2).replace('.', ',');
                    }

                    return modelValue;
                });
            }
        };
    });