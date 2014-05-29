'use strict';

angular.module('admin.roles', [])
    .config(function ($routeProvider) {

        $routeProvider.when('/admin/roles', {templateUrl: 'app/admin/roles/roles.html', controller: 'AdminRoleListCtrl'});
        $routeProvider.when('/admin/roles/edit/:id', {templateUrl: 'app/admin/roles/editRole.html', controller: 'AdminEditRoleCtrl'});
        $routeProvider.when('/admin/roles/new', {templateUrl: 'app/admin/roles/editRole.html', controller: 'AdminEditRoleCtrl'});
    })
    .controller('AdminRoleListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['name', 'description'];

            $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', options, function (error, result) {
                if (result) {
                    $scope.roles = result.items;
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
    .controller('AdminEditRoleCtrl', function ($scope, $routeParams, $location, $bbcForm, adminModulePath, $bbcTransport) {
        $scope.bbcForm = $bbcForm('baboon_role', '_id');
        $scope.isReadOnly = false;
        $scope.isPartialReadOnly = false;

        function checkEditState () {
            $scope.isReadOnly = $scope.bbcForm.model.name === 'Admin' || $scope.bbcForm.model.name === 'User' || $scope.bbcForm.model.name === 'Guest';
            $scope.isAdmin = $scope.bbcForm.model.name === 'Admin';
        }

        if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'roles/roles/getById', { id: $routeParams.id }, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(result);
                    checkEditState();
                }
            });
        }
        else {
            checkEditState();
        }

        $scope.setStyle = function (r) {
            for (var i = 0; i < $scope.bbcForm.model.rights.length; i++) {
                if ($scope.bbcForm.model.rights[i] === r._id) {
                    return { 'border-left': '3px solid green' };
                }
            }

            return null;
        };

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var method = model._id ? 'roles/roles/update' : 'roles/roles/create';

            $bbcTransport.emit(adminModulePath + method, model, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/roles');
                } else if (error) {
                    if (error.name === 'ValidationError') {
                        $scope.bbcForm.populateValidation($scope.form, error.errors);
                    }
                }
            });
        };

        $bbcTransport.emit(adminModulePath + 'rights/rights/getAll', function (error, result) {
            if (result) {
                $scope.rights = result.items;
            }
        });
    });