'use strict';

angular.module('admin.groups', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/groups', {templateUrl: 'app/admin/groups/groups.html', controller: 'AdminGroupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: 'app/admin/groups/editGroup.html', controller: 'AdminEditGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: 'app/admin/groups/editGroup.html', controller: 'AdminEditGroupCtrl'});
    })
    .controller('AdminGroupListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['_id', 'name', 'description'];

            $bbcTransport.emit(adminModulePath + 'groups/groups/getAll', options, function (error, result) {
                if (result) {
                    $scope.groups = result.items;
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
    })
    .controller('AdminEditGroupCtrl', function ($scope, $routeParams, $location, $bbcForm, adminModulePath, $bbcTransport) {
        $scope.bbcForm = $bbcForm('baboon_group', '_id');

        if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'groups/groups/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(result);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var method = model._id ? 'groups/groups/update' : 'groups/groups/create';

            $bbcTransport.emit(adminModulePath + method, model, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/groups');
                }
                else {
                    if (error.name === 'ValidationError') {
                        $scope.bbcForm.populateValidation($scope.form, error.errors);
                    }
                }
            });
        };

        $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', { options: { sort: { name: 1 }, fields: ['name', 'description'] } }, function (error, result) {
            if (result) {
                $scope.roles = result.items;
            }
        });
    });
