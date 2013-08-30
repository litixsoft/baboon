/*global angular */
angular.module('lx.pager', [])
    .directive('lxPager', function () {
        return {
            restrict: 'E',
            template: '<div class="btn-group" data-id="lxPager">' +
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

                /**
                 * Call function from controller to reload the data.
                 */
                scope.refresh = function () {
                    scope.onPaging({pagingOptions: scope.getOptions()});
                };

                /**
                 * Gets the number of items to skip.
                 *
                 * @returns {number}
                 */
                scope.skip = function () {
                    return (scope.currentPage - 1) * scope.pageSize;
                };

                /**
                 * Gets the number of pages.
                 *
                 * @returns {number}
                 */
                scope.numberOfPages = function () {
                    if (scope.pageSize < 1) {
                        scope.pageSize = 1;
                    }

                    return Math.ceil(scope.count / scope.pageSize);
                };

                /**
                 * Gets the paging options.
                 *
                 * @returns {{limit: number, skip: number}}
                 */
                scope.getOptions = function () {
                    return {
                        limit: scope.pageSize,
                        skip: scope.skip()
                    };
                };

                /**
                 * Go to next page
                 */
                scope.nextPage = function () {
                    var currentPage = scope.currentPage,
                        count = currentPage * scope.pageSize;

                    if (count < scope.count) {
                        scope.currentPage = ++currentPage;
                    }
                };

                /**
                 * Go to previous page
                 */
                scope.previousPage = function () {
                    var currentPage = scope.currentPage;

                    if (currentPage !== 1) {
                        scope.currentPage = --currentPage;
                    }
                };

                /**
                 * Go to first page
                 */
                scope.firstPage = function () {
                    scope.currentPage = 1;
                };

                /**
                 * Go to last page
                 */
                scope.lastPage = function () {
                    scope.currentPage = scope.numberOfPages() || 1;
                };

                /**
                 * Trigger reload if currentPage changes.
                 */
                scope.$watch('currentPage', function (oldValue, newValue) {
                    if (oldValue !== newValue) {
                        scope.refresh();
                    }
                });

                /**
                 * Update current page when current page is greater than number of pages.
                 */
                scope.$watch('count', function () {
                    if (scope.currentPage > scope.numberOfPages() && scope.numberOfPages() > 0) {
                        scope.currentPage = scope.numberOfPages() || 1;
                    }
                });

                /**
                 * Trigger reload if page size changes.
                 */
                scope.$watch('pageSize', function (oldValue, newValue) {
                    // set current page to number of pages when current page is greater than number of pages
                    if (scope.currentPage > scope.numberOfPages()) {
                        scope.currentPage = scope.numberOfPages() || 1;
                    } else if (oldValue !== newValue) {
                        scope.refresh();
                    }
                });
            }
        };
    });