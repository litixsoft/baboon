/*global angular*/
angular.module('admin', ['admin.services', 'admin.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/users', {templateUrl: 'admin/tpls/users.html', controller: 'adminUserListCtrl'});
        $routeProvider.when('/admin/users/edit/:id', {templateUrl: 'admin/tpls/editUser.html', controller: 'adminEditUserCtrl'});
        $routeProvider.when('/admin/users/new', {templateUrl: 'admin/tpls/editUser.html', controller: 'adminEditUserCtrl'});
        $routeProvider.when('/admin/rights', {templateUrl: 'admin/tpls/rights.html', controller: 'adminRightListCtrl'});
        $routeProvider.when('/admin/rights/edit/:id', {templateUrl: 'admin/tpls/editRight.html', controller: 'adminEditRightCtrl'});
        $routeProvider.when('/admin/rights/new', {templateUrl: 'admin/tpls/editRight.html', controller: 'adminEditRightCtrl'});
        $routeProvider.when('/admin/groups', {templateUrl: 'admin/tpls/groups.html', controller: 'adminGroupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: 'admin/tpls/editGroup.html', controller: 'adminEditGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: 'admin/tpls/editGroup.html', controller: 'adminEditGroupCtrl'});
        $routeProvider.when('/admin/roles', {templateUrl: 'admin/tpls/roles.html', controller: 'adminRoleListCtrl'});
        $routeProvider.when('/admin/roles/edit/:id', {templateUrl: 'admin/tpls/editRole.html', controller: 'adminEditRoleCtrl'});
        $routeProvider.when('/admin/roles/new', {templateUrl: 'admin/tpls/editRole.html', controller: 'adminEditRoleCtrl'});
    })
    .constant('admin.modulePath', 'baboon/admin/')
    .controller('adminUserListCtrl', ['$scope', '$log', 'adminUsers', function ($scope, $log, users) {
        var options = {},
            callback = function (result) {
                if (result.data) {
                    $scope.users = result.data;
                    $scope.count = result.count;
                } else {
                    $log.log(result);
                }
            },
            getData = function () {
                var query = {
                    params: {},
                    options: options || {}
                };

                users.getAll(query, callback);
            };

        $scope.getData = function (pagingOptions) {
            if (pagingOptions) {
                options.skip = pagingOptions.skip;
                options.limit = pagingOptions.limit;
            }

            getData();
        };

        $scope.getData();
    }])
    .controller('adminEditUserCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'adminUsers', '$log', 'adminRights', 'adminGroups', function ($scope, $routeParams, $location, lxForm, users, $log, rights, groups) {
        $scope.lxForm = lxForm('baboon_right', '_id');

        $scope.isPasswordConfirmed = function () {
            return $scope.lxForm.model.password === $scope.lxForm.model.confirmedPassword;
        };

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            users.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    $log.log(result.message);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (result) {
                if (result.data || result.success) {
                    $scope.lxForm.setModel(result.data || model, true);
                    $location.path('/admin/users');
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    }

                    if (result.message) {
                        $log.log(result.message);
                    }
                }
            };

            if (model._id) {
                users.update(model, callback);
            } else {
                users.create(model, callback);
            }
        };

        $scope.addRight = function (right) {
            right.hasAccess = right.hasAccess || false;
            $scope.lxForm.model.rights = $scope.lxForm.model.rights || [];
            $scope.lxForm.model.rights.push(right);

            $scope.addingRight = false;
            $scope.addedRight = {};
        };

//        $scope.getRightName = function (right) {
//            var i, name;
//            var length = ($scope.rights || []).length;
//
//            for (i = 0; i < length; i++) {
//                if ($scope.rights[i]._id === right._id) {
//                    name = $scope.rights[i].name;
//                    return;
//                }
//            }
//
//            return name;
//        };

        $scope.removeRight = function (right) {
            var index = $scope.lxForm.model.rights.indexOf(right);

            if (index > -1) {
                $scope.lxForm.model.rights.splice(index, 1);
            }
        };

        rights.getAll({}, function (result) {
            if (result.data) {
                $scope.rights = result.data;
            }
        });

        groups.getAll({}, function (result) {
            if (result.data) {
                $scope.groups = result.data;
            }
        });
    }])
    .controller('adminRightListCtrl', ['$scope', '$log', 'adminRights', function ($scope, $log, rights) {
        $scope.pagingOptions = {skip: 0, limit: 10};
        $scope.sortOpts = {name: 1};

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {}
            };

            if (pagingOptions) {
                $scope.pagingOptions = pagingOptions;
            }

            if (sortingOptions) {
                $scope.sortOpts = sortingOptions;
            }

            query.options.sort = $scope.sortOpts;
            query.options.skip = $scope.pagingOptions.skip;
            query.options.limit = $scope.pagingOptions.limit;

            rights.getAll(query, function (result) {
                if (result.data) {
                    $scope.rights = result.data;
                    $scope.count = result.count;
                } else {
                    $log.log(result);
                }
            });
        };

        $scope.getData();
    }])
    .controller('adminEditRightCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'adminRights', '$log', function ($scope, $routeParams, $location, lxForm, rights, $log) {
        $scope.lxForm = lxForm('baboon_right', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            rights.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    $log.log(result.message);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (result) {
                if (result.data || result.success) {
                    $scope.lxForm.setModel(result.data || model, true);
                    $location.path('/admin/rights');
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    }

                    if (result.message) {
                        $log.log(result.message);
                    }
                }
            };

            if (model._id) {
                rights.update(model, callback);
            } else {
                rights.create(model, callback);
            }
        };
    }])
    .controller('adminGroupListCtrl', ['$scope', '$log', 'adminGroups', function ($scope, $log, groups) {
        var options = {},
            callback = function (result) {
                if (result.data) {
                    $scope.groups = result.data;
                    $scope.count = result.count;
                } else {
                    $log.log(result);
                }
            },
            getData = function () {
                var query = {
                    params: {},
                    options: options || {}
                };

                groups.getAll(query, callback);
            };

        $scope.getData = function (pagingOptions) {
            if (pagingOptions) {
                options.skip = pagingOptions.skip;
                options.limit = pagingOptions.limit;
            }

            getData();
        };

        $scope.getData();
    }])
    .controller('adminEditGroupCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'adminGroups', '$log', 'adminRights', function ($scope, $routeParams, $location, lxForm, groups, $log, rights) {
        $scope.lxForm = lxForm('baboon_group', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            groups.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    $log.log(result.message);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (result) {
                if (result.data || result.success) {
                    $scope.lxForm.setModel(result.data || model, true);
                    $location.path('/admin/groups');
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    }

                    if (result.message) {
                        $log.log(result.message);
                    }
                }
            };

            if (model._id) {
                groups.update(model, callback);
            } else {
                groups.create(model, callback);
            }
        };

        rights.getAll({}, function (result) {
            if (result.data) {
                $scope.rights = result.data;
                $scope.rightsObj = rights.convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
            }
        });

        $scope.setRight = function (right) {
            if (!$scope.lxForm.model.rights) {
                $scope.lxForm.model.rights = [];
            }

            if (right.isSelected && $scope.lxForm.model.rights.indexOf(right._id) < 0) {
                $scope.lxForm.model.rights.push(right._id);
            } else if (!right.isSelected) {
                var index = $scope.lxForm.model.rights.indexOf(right._id);

                if (index > 0) {
                    $scope.lxForm.model.rights.splice(index, 1);
                }
            }
        };

        $scope.reset = function (form) {
            $scope.lxForm.reset(form);

            $scope.rightsObj = rights.convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
        };
    }])
    .controller('adminRoleListCtrl', ['$scope', '$log', 'adminRoles', function ($scope, $log, roles) {
        $scope.getData = function (pagingOptions) {
            var query = {
                params: {},
                options: {}
            };

            if (pagingOptions) {
                query.options.skip = pagingOptions.skip;
                query.options.limit = pagingOptions.limit;
            }

            roles.getAll(query, function (result) {
                if (result.data) {
                    $scope.roles = result.data;
                    $scope.count = result.count;
                } else {
                    $log.log(result);
                }
            });
        };

        $scope.getData({skip: 0, limit: 5});
    }])
    .controller('adminEditRoleCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'adminGroups', '$log', 'adminRights', function ($scope, $routeParams, $location, lxForm, groups, $log, rights) {
        $scope.lxForm = lxForm('baboon_group', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            groups.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    $log.log(result.message);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (result) {
                if (result.data || result.success) {
                    $scope.lxForm.setModel(result.data || model, true);
                    $location.path('/admin/groups');
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    }

                    if (result.message) {
                        $log.log(result.message);
                    }
                }
            };

            if (model._id) {
                groups.update(model, callback);
            } else {
                groups.create(model, callback);
            }
        };

        rights.getAll({}, function (result) {
            if (result.data) {
                $scope.rights = result.data;
                $scope.rightsObj = rights.convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
            }
        });

        $scope.setRight = function (right) {
            if (!$scope.lxForm.model.rights) {
                $scope.lxForm.model.rights = [];
            }

            if (right.isSelected && $scope.lxForm.model.rights.indexOf(right._id) < 0) {
                $scope.lxForm.model.rights.push(right._id);
            } else if (!right.isSelected) {
                var index = $scope.lxForm.model.rights.indexOf(right._id);

                if (index > 0) {
                    $scope.lxForm.model.rights.splice(index, 1);
                }
            }
        };

        $scope.reset = function (form) {
            $scope.lxForm.reset(form);

            $scope.rightsObj = rights.convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
        };
    }]);