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

                    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'number') {
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
    });