'use strict';

angular.module('admin.groups', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/groups', {templateUrl: 'app/admin/groups/groups.html', controller: 'AdminGroupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: 'app/admin/groups/editGroup.html', controller: 'AdminEditGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: 'app/admin/groups/editGroup.html', controller: 'AdminEditGroupCtrl'});
    })
    .controller('AdminGroupListCtrl', function ($rootScope, $scope, adminModulePath, $bbcTransport, $bbcModal, $translate) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var header = 'Del';
        var msg = 'Del';
        var btnTextValues = { yes: 'j', no: 'n' };

        $rootScope.$on('$translateChangeSuccess', function () {
            setLang();
        });

        var setLang = function() {
            $translate(['DELETE', 'DELETE_MSG', 'YES', 'NO']).then(function (v) {
                header = v.DELETE;
                msg = v.DELETE_MSG;
                btnTextValues.yes = v.YES;
                btnTextValues.no = v.NO;
            });
        };

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

        setLang();

        $scope.load = function (sort, page) {
            $scope.pagingOptions = page;
            $scope.sortOpts = sort;
            getData();
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.alerts = [];
        $scope.remove = function(id) {
            $scope.alerts.length = 0;
            var options = { id: 'deleteGroup', message: msg, headline: header, backdrop: false, buttonTextValues: btnTextValues };
            options.callObj = {
                cbYes: function () {
                    $bbcTransport.emit(adminModulePath + 'groups/groups/remove', { id: id }, function (error) {
                        if (error) {
                            if (error.name === 'ControllerError') {
                                $scope.alerts.push({ type: 'danger', msg: error.message });
                            }
                            else {
                                $scope.alerts.push({ type: 'danger', msg: 'GENERIC_ERROR' });
                            }
                        }
                        else {
                            getData();
                        }
                    });
                },
                cbNo: function () { }
            };
            $bbcModal.open(options);
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
