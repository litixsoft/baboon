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
    'common.auth',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'common.checklist'
])
    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {
        // Routing and navigation
        $routeProvider.when('/admin', {templateUrl: 'app/admin/admin.html', controller: 'AdminCtrl'});
        $routeProvider.when('/admin/users', {templateUrl: 'app/admin/tpls/users.html', controller: 'AdminUserListCtrl'});
        $routeProvider.when('/admin/users/edit/:id', {templateUrl: 'app/admin/tpls/editUser.html', controller: 'AdminEditUserCtrl'});
        $routeProvider.when('/admin/users/new', {templateUrl: 'app/admin/tpls/editUser.html', controller: 'AdminEditUserCtrl'});
        $routeProvider.when('/admin/rights', {templateUrl: 'app/admin/tpls/rights.html', controller: 'AdminRightListCtrl'});
        $routeProvider.when('/admin/groups', {templateUrl: 'app/admin/tpls/groups.html', controller: 'AdminGroupListCtrl'});
        $routeProvider.when('/admin/groups/edit/:id', {templateUrl: 'app/admin/tpls/editGroup.html', controller: 'AdminEditGroupCtrl'});
        $routeProvider.when('/admin/groups/new', {templateUrl: 'app/admin/tpls/editGroup.html', controller: 'AdminEditGroupCtrl'});
        $routeProvider.when('/admin/roles', {templateUrl: 'app/admin/tpls/roles.html', controller: 'AdminRoleListCtrl'});
        $routeProvider.when('/admin/roles/edit/:id', {templateUrl: 'app/admin/tpls/editRole.html', controller: 'AdminEditRoleCtrl'});
        $routeProvider.when('/admin/roles/new', {templateUrl: 'app/admin/tpls/editRole.html', controller: 'AdminEditRoleCtrl'});
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
    .service('compareService', function () {
        var pub = {};

        // compare functions for array.sort()

        // compares two numbers
        pub.compareNumbers = function (a, b) {
            return a - b;
        };

        // compares two values
        pub.compareValues = function (a, b) {
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0;
            }
        };

        // compares two number fields from objects
        pub.compareByNumberField = function (a, b, field) {
            return a[field] - b[field];
        };

        // compares two fields from objects
        pub.compareByField = function (a, b, field) {
            if (a[field] > b[field]) {
                return 1;
            } else if (a[field] < b[field]) {
                return -1;
            } else {
                return 0;
            }
        };

        return pub;
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
    .controller('AdminUserListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize };
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['name', 'email', 'is_active'];

            $bbcTransport.emit(adminModulePath + 'user/getAll', options, function (error, result) {
                if (result) {
                    console.log(result.items);
                    $scope.users = result.items;
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
    .controller('AdminEditUserCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath, compareService) {
        $scope.bbcForm = $bbcForm('baboon_right', '_id');

        $scope.isPasswordConfirmed = function () {
            return $scope.bbcForm.model.password === $scope.bbcForm.model.confirmed_password;
        };

        if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
                $bbcTransport.emit(adminModulePath + 'user/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    delete result.register_date;

                    $scope.bbcForm.setModel(result);
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
                    $scope.bbcForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/users');
                } else if (error) {
                    if (error.name === 'ValidationError') {
                        $scope.bbcForm.populateValidation($scope.form, error.errors);
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
            $scope.bbcForm.model.rights = $scope.bbcForm.model.rights || [];

            var i;
            var length = $scope.bbcForm.model.rights.length;

            for (i = 0; i < length; i++) {
                if ($scope.bbcForm.model.rights[i]._id === rightToAdd._id) {
                    $scope.addRightMsg = 'Right was already added';
                    return;
                }
            }

            $scope.bbcForm.model.rights.push(rightToAdd);
            $scope.bbcForm.model.rights.sort(function (a, b) {
                return compareService.compareByField(a, b, '_id');
            });

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
            var index = $scope.bbcForm.model.rights.indexOf(right);

            if (index > -1) {
                $scope.bbcForm.model.rights.splice(index, 1);
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

                if ($scope.bbcForm.model.groups) {
                    angular.forEach($scope.bbcForm.model.groups, function (groupId) {
                        angular.forEach($scope.groups, function (group) {
                            if (group._id === groupId) {
                                group.isSelected = true;
                            }
                        });
                    });
                }
            }
        });

        $bbcTransport.emit(adminModulePath + 'role/getAll', {options: {fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.roles = result.items;

                if ($scope.bbcForm.model.roles) {
                    angular.forEach($scope.bbcForm.model.roles, function (roleId) {
                        angular.forEach($scope.roles, function (role) {
                            if (role._id === roleId) {
                                role.isSelected = true;
                            }
                        });
                    });
                }
            }
        });

        $scope.reset = function (form) {
            $scope.bbcForm.reset(form);
            $scope.bbcForm.model.roles = $scope.bbcForm.model.roles || [];
            $scope.bbcForm.model.groups = $scope.bbcForm.model.groups || [];

            angular.forEach($scope.roles, function (role) {
                var indexOfRole = $scope.bbcForm.model.roles.indexOf(role._id);

                role.isSelected = indexOfRole !== -1;
            });

            angular.forEach($scope.groups, function (group) {
                var indexOfGroup = $scope.bbcForm.model.groups.indexOf(group._id);

                group.isSelected = indexOfGroup !== -1;
            });
        };
    })

    .controller('AdminRightListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;

            $bbcTransport.emit(adminModulePath + 'right/getAll', options, function (error, result) {
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
    })
    .controller('AdminGroupListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['_id', 'name', 'description'];

            $bbcTransport.emit(adminModulePath + 'group/getAll', options, function (error, result) {
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
            $bbcTransport.emit(adminModulePath + 'group/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(result);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var method =  model._id ?  'group/update' : 'group/create';

            $bbcTransport.emit(adminModulePath + method, model, function (error, result) {
                console.log('error', error);
                console.log('result', result);
                if (result) {
                    $scope.bbcForm.setModel(typeof(result.data) === 'object' ? result.data : model, true);
                    $location.path('/admin/groups');
                }
                else if (error) {
                    if (error.name === 'ValidationError') {
                        $scope.bbcForm.populateValidation($scope.form, error.errors);
                    }
                }
            });
        };

        $bbcTransport.emit(adminModulePath + 'role/getAll', { options: { sort: { name: 1 }, fields: ['name', 'description'] } }, function (error, result) {
            if (result) {
                $scope.roles = result.items;
            }
        });
    })
    .controller('AdminRoleListCtrl', function ($scope, adminModulePath, $bbcTransport) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = { name: 1 };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['name', 'description'];

            $bbcTransport.emit(adminModulePath + 'role/getAll', options, function (error, result) {
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

        if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'role/getById', { id: $routeParams.id }, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(result);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var method = model._id ? 'role/update' : 'role/create';

            $bbcTransport.emit(adminModulePath + method, model, function (error, result) {
                if (result) {
                    $scope.bbcForm.setModel(typeof(result) === 'object' ? result : model, true);
                    $location.path('/admin/roles');
                } else if (error) {
                    if (error.validation) {
                        $scope.bbcForm.populateValidation($scope.form, error.validation);
                    }
                }
            });
        };

        $bbcTransport.emit(adminModulePath + 'right/getAll', function (error, result) {
            if (result) {
                $scope.rights = result.items;
            }
        });
    });