'use strict';

angular.module('admin.rights', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/rights', {templateUrl: 'app/admin/rights/rights.html', controller: 'AdminRightListCtrl'});
    })
    .controller('AdminRightListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;

            $bbcTransport.emit(adminModulePath + 'rights/rights/getAll', options, function (error, result) {
                if (result) {
                    $scope.rights = result.items;
                    $scope.count = result.count;
                }
            });
        };

        $scope.load = function (sort, page) {
            $scope.pagingOptions = page;
            $scope.sortOpts = sort;
            getData();
        };

        getData();
    });
