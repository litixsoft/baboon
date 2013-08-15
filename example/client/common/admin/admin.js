/*global angular*/
angular.module('admin', ['baboon.admin.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/users', {templateUrl: '/admin/users.html', controller: 'userListCtrl'});
        $routeProvider.when('/admin/users/edit/:id', {templateUrl: '/admin/editUser.html', controller: 'editUserCtrl'});
        $routeProvider.when('/admin/users/new', {templateUrl: '/admin/editUser.html', controller: 'editUserCtrl'});
        $routeProvider.when('/admin/rights', {templateUrl: '/admin/rights.html', controller: 'rightListCtrl'});
        $routeProvider.when('/admin/rights/edit/:id', {templateUrl: '/admin/editRight.html', controller: 'editRightCtrl'});
        $routeProvider.when('/admin/rights/new', {templateUrl: '/admin/editRight.html', controller: 'editRightCtrl'});
        $routeProvider.when('/admin/groups', {templateUrl: '/admin/groups.html', controller: 'groupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: '/admin/editGroup.html', controller: 'editGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: '/admin/editGroup.html', controller: 'editGroupCtrl'});
    })
    .controller('userListCtrl', ['$scope', '$log', 'baboon.admin.users', function ($scope, $log, users) {
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
    .controller('editUserCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'baboon.admin.users', '$log', 'baboon.admin.rights', 'baboon.admin.groups', function ($scope, $routeParams, $location, lxForm, users, $log, rights, groups) {
        $scope.lxForm = lxForm('baboon_right', '_id');

        $scope.isPasswordConfirmed = function() {
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
    .controller('rightListCtrl', ['$scope', '$log', 'baboon.admin.rights', function ($scope, $log, rights) {
        var options = {},
            callback = function (result) {
                if (result.data) {
                    $scope.rights = result.data;
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

                rights.getAll(query, callback);
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
    .controller('editRightCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'baboon.admin.rights', '$log', function ($scope, $routeParams, $location, lxForm, rights, $log) {
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
    .controller('groupListCtrl', ['$scope', '$log', 'baboon.admin.groups', function ($scope, $log, groups) {
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
    .controller('editGroupCtrl', ['$scope', '$routeParams', '$location', 'lxForm', 'baboon.admin.groups', '$log', 'baboon.admin.rights', function ($scope, $routeParams, $location, lxForm, groups, $log, rights) {
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
            }
        });
    }]);