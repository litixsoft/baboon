'use strict';

angular.module('admin', [
    'ngRoute',
    'ui.bootstrap',
    'bbc.transport',
    'bbc.navigation',
    'bbc.cache',
    'bbc.form',
    'bbc.pager',
    'bbc.sort',
    'bbc.session',
    'pascalprecht.translate',
    'tmh.dynamicLocale'
])

    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {

        // Routing and navigation
        $routeProvider.when('/admin', {templateUrl: 'app/admin/admin.html', controller: 'AdminCtrl'});
        $routeProvider.when('/admin/users', {templateUrl: 'app/admin/tpls/users.html', controller: 'adminUserListCtrl'});
        $routeProvider.when('/admin/users/edit/:id', {templateUrl: 'app/admin/tpls/editUser.html', controller: 'adminEditUserCtrl'});
        $routeProvider.when('/admin/users/new', {templateUrl: 'app/admin/tpls/editUser.html', controller: 'adminEditUserCtrl'});
        $routeProvider.when('/admin/rights', {templateUrl: 'app/admin/tpls/rights.html', controller: 'adminRightListCtrl'});
        $routeProvider.when('/admin/rights/edit/:id', {templateUrl: 'app/admin/tpls/editRight.html', controller: 'adminEditRightCtrl'});
        $routeProvider.when('/admin/rights/new', {templateUrl: 'app/admin/tpls/editRight.html', controller: 'adminEditRightCtrl'});
        $routeProvider.when('/admin/groups', {templateUrl: 'app/admin/tpls/groups.html', controller: 'adminGroupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: 'app/admin/tpls/editGroup.html', controller: 'adminEditGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: 'app/admin/tpls/editGroup.html', controller: 'adminEditGroupCtrl'});
        $routeProvider.when('/admin/roles', {templateUrl: 'app/admin/tpls/roles.html', controller: 'adminRoleListCtrl'});
        $routeProvider.when('/admin/roles/edit/:id', {templateUrl: 'app/admin/tpls/editRole.html', controller: 'adminEditRoleCtrl'});
        $routeProvider.when('/admin/roles/new', {templateUrl: 'app/admin/tpls/editRole.html', controller: 'adminEditRoleCtrl'});
        $routeProvider.otherwise({redirectTo: '/admin'});

        $locationProvider.html5Mode(true);

        $bbcNavigationProvider.set({
            app: 'admin',
            route: '/admin'
        });

        // Transport
        $bbcTransportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/admin/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })

    .constant('adminModulePath', 'api/app/admin/')

    .run(function ($rootScope, $translate, tmhDynamicLocale, $log, $window, $bbcSession) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function (locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

        // flag for needed request by next route change event
        $rootScope.requestNeeded = false;

        // route change event
        $rootScope.$on('$routeChangeStart', function (current, next) {

            // set activity and check session
            $bbcSession.setActivity(function (error) {

                // check session activity error
                if (error) {
                    $log.warn(error);
                    $rootScope.$emit('$sessionInactive');
                }
            });

            // when request needed is true than make a request with next route
            if ($rootScope.requestNeeded) {
                $window.location.assign(next.$$route.originalPath);
            }
        });

        // session inactive event, triggered when session inactive or lost
        $rootScope.$on('$sessionInactive', function () {
            $log.warn('next route change event triggers a server request.');
            $rootScope.requestNeeded = true;
        });

        // translate
        $rootScope.$on('$translateChangeSuccess', function () {
            tmhDynamicLocale.set($translate.use());
        });
    })

    .controller('AdminCtrl', function ($scope, $bbcTransport, $log) {
        $bbcTransport.emit('api/common/awesomeThings/index/getAll', function (error, result) {
            if (!error && result) {
                $scope.awesomeThings = result;
            }
            else {
                $scope.awesomeThings = [];
                $log.error(error);
            }
        });

        $scope.view = 'app/admin/admin.html';
    })

    .controller('adminUserListCtrl', function ($scope, $log, $bbcTransport, adminModulePath) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = {skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = {name: 1};

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {
                    fields: ['name', 'email', 'id']
                }
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

            $bbcTransport.emit(adminModulePath + 'user/getAll', query, function (error, result) {
                if (result) {
                    $scope.users = result.items;
                    $scope.count = result.count;
                } else {
                    $log.log(error);
                }
            });
        };

        $scope.getData();
    })
    .controller('adminEditUserCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath) {
        $scope.lxForm = $bbcForm('baboon_right', '_id');

        $scope.isPasswordConfirmed = function () {
            return $scope.lxForm.model.password === $scope.lxForm.model.confirmed_password;
        };

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'user/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result);
                } else {
                    $log.log(error);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/users');
                } else if (error) {
                    if (error.name === 'ValidationError') {
                        $scope.lxForm.populateValidation($scope.form, error.errors);
                        console.log(error.errors);
                    } else {
                        $log.log(error);
                    }
                }
            };

            if (model._id) {
                $bbcTransport.emit(adminModulePath + 'user/update', model, callback);
            } else {
                $bbcTransport.emit(adminModulePath + 'user/create', model, callback);
            }
        };

        $scope.addRight = function (rightToAdd) {
            rightToAdd.hasAccess = rightToAdd.hasAccess || false;
            $scope.lxForm.model.rights = $scope.lxForm.model.rights || [];

            var i;
            var length = $scope.lxForm.model.rights.length;

            for (i = 0; i < length; i++) {
                if ($scope.lxForm.model.rights[i]._id === rightToAdd._id) {
                    $scope.addRightMsg = 'Right was already added';
                    return;
                }
            }

            $scope.lxForm.model.rights.push(rightToAdd);

            $scope.addingRight = false;
            $scope.addedRight = {};
            $scope.addRightMsg = '';
        };

        $scope.cancelAddRight = function () {
            $scope.addingRight = false;
            $scope.addedRight = {};
            $scope.addRightMsg = '';
        };

        $scope.getRightName = function (rightId) {
            var i, name;
            var length = ($scope.rights || []).length;

            for (i = 0; i < length; i++) {
                if ($scope.rights[i]._id === rightId) {
                    name = $scope.rights[i].name;
                    return name;
                }
            }

            return name;
        };

        $scope.removeRight = function (right) {
            var index = $scope.lxForm.model.rights.indexOf(right);

            if (index > -1) {
                $scope.lxForm.model.rights.splice(index, 1);
            }
        };

        $bbcTransport.emit(adminModulePath + 'right/getAll', function (error, result) {
            if (result) {
                $scope.rights = result.items;
            }
        });

        $bbcTransport.emit(adminModulePath + 'group/getAll', {options: {fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.groups = result.items;

                if ($scope.lxForm.model.groups) {
                    angular.forEach($scope.lxForm.model.groups, function (groupId) {
                        angular.forEach($scope.groups, function (group) {
                            if (group._id === groupId) {
                                group.isSelected = true;
                            }
                        });
                    });
                }
            }
        });

        $scope.setGroup = function (group) {
            $scope.lxForm.model.groups = $scope.lxForm.model.groups || [];

            var indexOfGroup = $scope.lxForm.model.groups.indexOf(group._id);

            if (group.isSelected && indexOfGroup === -1) {
                $scope.lxForm.model.groups.push(group._id);
            } else if (!group.isSelected && indexOfGroup !== -1) {
                $scope.lxForm.model.groups.splice(indexOfGroup, 1);
            }
        };

        $bbcTransport.emit(adminModulePath + 'role/getAll', {options: {fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.roles = result.items;

                if ($scope.lxForm.model.roles) {
                    angular.forEach($scope.lxForm.model.roles, function (roleId) {
                        angular.forEach($scope.roles, function (role) {
                            if (role._id === roleId) {
                                role.isSelected = true;
                            }
                        });
                    });
                }
            }
        });

        $scope.setRole = function (role) {
            $scope.lxForm.model.roles = $scope.lxForm.model.roles || [];

            var indexOfRole = $scope.lxForm.model.roles.indexOf(role._id);

            if (role.isSelected && indexOfRole === -1) {
                $scope.lxForm.model.roles.push(role._id);
            } else if (!role.isSelected && indexOfRole !== -1) {
                $scope.lxForm.model.roles.splice(indexOfRole, 1);
            }
        };

        $scope.reset = function (form) {
            $scope.lxForm.reset(form);
            $scope.lxForm.model.roles = $scope.lxForm.model.roles || [];
            $scope.lxForm.model.groups = $scope.lxForm.model.groups || [];

            angular.forEach($scope.roles, function (role) {
                var indexOfRole = $scope.lxForm.model.roles.indexOf(role._id);

                role.isSelected = indexOfRole !== -1;
            });

            angular.forEach($scope.groups, function (group) {
                var indexOfGroup = $scope.lxForm.model.groups.indexOf(group._id);

                group.isSelected = indexOfGroup !== -1;
            });
        };
    })

    .controller('adminRightListCtrl', function ($scope, $log, $bbcTransport, adminModulePath, $bbcCache) {

        var initial = false;

        if (!$bbcCache.pagingOptions) {
            $bbcCache.pagingOptions = {skip: 0, limit: 10};
        }

        if (!$bbcCache.sortOpts) {
            $bbcCache.sortOpts = {name: 1};
        }

        $scope.pagingOptions = $bbcCache.pagingOptions;
        $scope.sortOpts = $bbcCache.sortOpts;

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {}
            };

            if (pagingOptions && !initial) {
                $scope.pagingOptions = pagingOptions;
                $bbcCache.pagingOptions = pagingOptions;
            }

            if (sortingOptions) {
                $scope.sortOpts = sortingOptions;
                $bbcCache.sortOpts = sortingOptions;
            }

            initial = false;

            query.options.sort = $scope.sortOpts;
            query.options.skip = $scope.pagingOptions.skip;
            query.options.limit = $scope.pagingOptions.limit;

            $bbcTransport.emit(adminModulePath + 'right/getAll', query, function (error, result) {
                if (result) {
                    $scope.rights = result.items;
                    $scope.count = result.count;
                } else {
                    $log.error(error);
                }

                if ($scope.pagingOptions.limit && $scope.pageSize !== $scope.pagingOptions.limit) {
                    $scope.pageSize = $scope.pagingOptions.limit;
                }

                if ($scope.currentPage && $bbcCache.currentPage !== $scope.currentPage) {
                    $bbcCache.currentPage = $scope.currentPage;
                }
            });
        };

        if (!$bbcCache.currentPage) {
            $scope.getData($scope.sortOpts, $scope.pagingOptions);
        } else {
            initial = true;
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.currentPage = $bbcCache.currentPage;
                });
            }, 50);
        }

    })

    .controller('adminEditRightCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, adminModulePath, $log) {
        $scope.lxForm = $bbcForm('baboon_right', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'right/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result);
                } else {
                    $log.error(error);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(typeof(result.data) === 'object' ? result.data : model, true);
                    $location.path('/admin/rights');
                } else if (error) {
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.form, error.validation);
                    } else {
                        $log.error(error);
                    }
                }
            };

            if (model._id) {
                $bbcTransport.emit(adminModulePath + 'right/update', model, callback);
            } else {
                $bbcTransport.emit(adminModulePath + 'right/create', model, callback);
            }
        };
    })

    .controller('adminGroupListCtrl', function ($scope, $log, $bbcTransport, adminModulePath) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = {skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = {name: 1};

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {
                    fields: ['name', 'id']
                }
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

            $bbcTransport.emit(adminModulePath + 'group/getAll', query, function (error, result) {
                if (result) {
                    $scope.groups = result.items;
                    $scope.count = result.count;
                } else {
                    $log.log(error);
                }
            });
        };

        $scope.getData();
    })

    .controller('adminEditGroupCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath) {
        $scope.lxForm = $bbcForm('baboon_group', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'group/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result);
                } else {
                    $log.log(error);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(typeof(result.data) === 'object' ? result.data : model, true);
                    $location.path('/admin/groups');
                } else if (error) {
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.form, error.validation);
                    } else {
                        $log.error(error);
                    }
                }
            };

            if (model._id) {
                $bbcTransport.emit(adminModulePath + 'group/update', model, callback);
            } else {
                $bbcTransport.emit(adminModulePath + 'group/create', model, callback);
            }
        };

        $bbcTransport.emit(adminModulePath + 'role/getAll', {options: {fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.roles = result.items;

                if ($scope.lxForm.model.roles) {
                    angular.forEach($scope.lxForm.model.roles, function (roleId) {
                        angular.forEach($scope.roles, function (role) {
                            if (role._id === roleId) {
                                role.isSelected = true;
                            }
                        });
                    });
                }
            }
        });

        $scope.setRole = function (role) {
            $scope.lxForm.model.roles = $scope.lxForm.model.roles || [];

            var indexOfRole = $scope.lxForm.model.roles.indexOf(role._id);

            if (role.isSelected && indexOfRole === -1) {
                $scope.lxForm.model.roles.push(role._id);
            } else if (!role.isSelected && indexOfRole !== -1) {
                $scope.lxForm.model.roles.splice(indexOfRole, 1);
            }
        };

        $scope.reset = function (form) {
            $scope.lxForm.reset(form);
            $scope.lxForm.model.roles = $scope.lxForm.model.roles || [];

            angular.forEach($scope.roles, function (role) {
                var indexOfRole = $scope.lxForm.model.roles.indexOf(role._id);

                role.isSelected = indexOfRole !== -1;
            });
        };
    })

    .controller('adminRoleListCtrl', function ($scope, $log, $bbcTransport, adminModulePath) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = {skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = {name: 1};

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {
                    fields: ['name', 'description']
                }
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

            $bbcTransport.emit(adminModulePath + 'role/getAll', query, function (error, result) {
                if (result) {
                    $scope.roles = result.items;
                    $scope.count = result.count;
                } else {
                    $log.error(error);
                }
            });
        };

        $scope.getData();
    })

    .controller('adminEditRoleCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath) {
        $scope.lxForm = $bbcForm('baboon_role', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'role/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result);
                } else {
                    $log.error(error);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/roles');
                } else if (error) {
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.form, error.validation);
                    } else {
                        $log.error(error);
                    }
                }
            };

            if (model._id) {
                $bbcTransport.emit(adminModulePath + 'role/update', model, callback);
            } else {
                $bbcTransport.emit(adminModulePath + 'role/create', model, callback);
            }
        };

        var convertRightStringToObject = function (selectedRights, rightObj, right, path) {
            var s = right.name.split('/');
            var mod = s.shift();
            path = path || '';

            if (s.length === 1) {
                rightObj[mod] = rightObj[mod] || [];
                right.display_name = mod;
                right.isSelected = selectedRights.indexOf(right._id) > -1;
                right.name = path + right.name;
                rightObj[mod].push(right);
            } else {
                path += mod + '/';
                rightObj[mod] = rightObj[mod] || {children: {}};
                convertRightStringToObject(selectedRights, rightObj[mod].children, {_id: right._id, name: s.join('/'), description: right.description}, path);
            }
        };

        var convertToRightsObject = function (rights, selectedRights) {
            var res = {};
            selectedRights = selectedRights || [];

            var i;
            var length = rights.length;

            for (i = 0; i < length; i++) {
                convertRightStringToObject(selectedRights, res, rights[i]);
            }

            return res;
        };

        $bbcTransport.emit(adminModulePath + 'right/getAll', function (error, result) {
            if (result) {
                $scope.rights = result.items;
                $scope.rightsObj = convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
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

            $scope.rightsObj = convertToRightsObject($scope.rights, $scope.lxForm.model.rights);
        };
    });