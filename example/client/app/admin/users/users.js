'use strict';

angular.module('admin.users', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/admin/users', {templateUrl: 'app/admin/users/users.html', controller: 'AdminUserListCtrl'});
        $routeProvider.when('/admin/users/edit/:id', {templateUrl: 'app/admin/users/editUser.html', controller: 'AdminEditUserCtrl'});
        $routeProvider.when('/admin/users/new', {templateUrl: 'app/admin/users/editUser.html', controller: 'AdminEditUserCtrl'});
    })
    .controller('AdminUserListCtrl', function ($scope, adminModulePath, $bbcTransport, $bbcModal, $translate, $rootScope) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = { skip: 0, limit: $scope.initialPageSize };
        $scope.sortOpts = { name: 1 };

        var header = 'DEL';
        var msg = 'DEL';
        var btnTextValues = { yes: 'Y', no: 'N' };

        $rootScope.$on('$translateChangeSuccess', function () {
            setLang();
        });

        var setLang = function() {
            $translate(['DELETE_USER', 'DELETE_USER_MSG', 'YES', 'NO']).then(function (v) {
                header = v.DELETE_USER;
                msg = v.DELETE_USER_MSG;
                btnTextValues.yes = v.YES;
                btnTextValues.no = v.NO;
            });
        };

        var getData = function () {
            var options = { options: $scope.pagingOptions };
            options.options.sort = $scope.sortOpts;
            options.options.fields = ['name', 'email', 'is_active'];

            $bbcTransport.emit(adminModulePath + 'users/users/getAll', options, function (error, result) {
                if (result) {
                    for(var i = 0; i < result.items.length; i++) {
                        var name = result.items[i].name.toLowerCase();
                        result.items[i].canDelete = name !== 'guest';
                    }

                    $scope.users = result.items;
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
        $scope.remove = function(id, name) {
            $scope.alerts.length = 0;
            header = header + ' ' + name;
            var options = { id: 'deleteUser', message: msg, headline: header, backdrop: true, buttonTextValues: btnTextValues };
            options.callObj = {
                cbYes: function () {
                    $bbcTransport.emit(adminModulePath + 'users/users/remove', { id: id }, function (error) {
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
    .controller('AdminEditUserCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath, $q) {
        $scope.bbcForm = $bbcForm('baboon_right', '_id');

        $scope.languages = [
            {key: 'GERMAN', value: 'de-de'},
            {key: 'ENGLISH', value: 'en-us'}
        ];

        $scope.isPasswordConfirmed = function () {
            return $scope.bbcForm.model.password === $scope.bbcForm.model.confirmed_password;
        };

        function initState() {
            for(var i = 0; i < $scope.rights.length; i++) {
                $scope.rights[i].sort = $scope.rights[i].isSelected;
            }
        }

        function loadUser() {
            var deferred = $q.defer();
            if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
                $bbcTransport.emit(adminModulePath + 'users/users/getById', {id: $routeParams.id}, function (error, result) {
                    if (result) {
                        delete result.register_date;

                        if (result.name === 'guest') {
                            result.isGuest = true;
                        }

                        $scope.bbcForm.setModel(result);
                        deferred.resolve();
                    } else {
                        $log.log(error);
                        deferred.resolve();
                    }
                });
            } else {
                if (!$routeParams.id && !$scope.bbcForm.model._id) {
                    // set default guest role for new users
                    $scope.bbcForm.model.roles = [];
                    $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', {params: {name: 'Guest'}, options: {fields: ['_id']}}, function (error, result) {
                        if (result && result.items && result.items.length > 0) {
                            $scope.bbcForm.model.roles.push(result.items[0]._id);
                            $scope.bbcForm.setModel($scope.bbcForm.model);
                            deferred.resolve();
                        }
                    });
                } else {
                    deferred.resolve();
                }
            }
            return deferred.promise;
        }

        function loadAllRights() {
            var deferred = $q.defer();
            $bbcTransport.emit(adminModulePath + 'rights/rights/getAll', function (error, result) {
                if (result) {
                    $scope.rights = result.items;
                }
                deferred.resolve();
            });
            return deferred.promise;
        }

        $q.all([loadUser(), loadAllRights()]).then( function() {
            //initRights();

            $scope.$watchCollection('bbcForm.model.groups', function() {
                initRights();
            });

            $scope.$watchCollection('bbcForm.model.roles', function() {
                initRights();
            });
        });

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
                    } else {
                        $log.log(error);
                    }
                }
            };

            if (model._id) {
                $bbcTransport.emit(adminModulePath + 'users/users/update', model, callback);
            } else {
                $bbcTransport.emit(adminModulePath + 'users/users/create', model, callback);
            }
        };

        var getAllUserRoles = function(callback) {
            // collect all roles from user and his groups
            $bbcTransport.emit(adminModulePath + 'groups/groups/getByIds', {ids: $scope.bbcForm.model.groups}, function (error, result) {
                if (result) {
                    var allRoles = [];
                    var allRolesWithoutDups = [];

                    // collect all roles from groups and user
                    angular.forEach(result.items, function(group) {
                        allRoles = allRoles.concat(group.roles);
                    });

                    allRoles = allRoles.concat($scope.bbcForm.model.roles);

                    // remove duplicates
                    var found;
                    for (var x = 0; x < allRoles.length; x++) {
                        found = false;
                        for (var y = 0; y < allRolesWithoutDups.length; y++) {
                            if (allRoles[x] === allRolesWithoutDups[y]) {
                                found = true;
                            }
                        }
                        if (!found) {
                            allRolesWithoutDups.push(allRoles[x]);
                        }
                    }

                    //get all rights in roles
                    $bbcTransport.emit(adminModulePath + 'roles/roles/getByIds', {ids: allRolesWithoutDups}, function (error, result) {
                        if (result) {
                            callback(error, result.items || []);
                        }
                    });
                }
            });
        };

        function initRights() {
            $scope.bbcForm.model.rights = $scope.bbcForm.model.rights || [];
            $scope.bbcForm.model.roles = $scope.bbcForm.model.roles || [];
            $scope.bbcForm.model.groups = $scope.bbcForm.model.groups || [];

            getAllUserRoles(function(error, result) {
                if (result) {
                    var rolesRights = result;
                    var allRights = $scope.rights;
                    var selectedRights = $scope.bbcForm.model.rights;

                    if (angular.isArray(allRights)) {
                        // compare all rights
                        angular.forEach(allRights, function(right) {
                            right.source = [];
                            right.isSelected = false;

                            // with rights from roles
                            angular.forEach(rolesRights, function(role) {
                                angular.forEach(role.rights, function(roleRight) {
                                    if (right._id === roleRight) {
                                        right.source.push(role.name);
                                        right.isSelected = true;
                                        return false;
                                    }
                                });
                            });

                            // and with rightsettings in user
                            angular.forEach(selectedRights, function(selectedRight) {
                                if (right._id === selectedRight._id) {
                                    right.isSelected = selectedRight.hasAccess;
                                    return false;
                                }
                            });
                        });
                    }
                    initState();
                }
            });
        }

        $scope.setRight = function (right) {
            var extractId = function (e) {
                return e._id;
            };

            var index = $scope.bbcForm.model.rights.map(extractId).indexOf(right._id);

            if (right.source.length > 0 && right.isSelected || right.source.length <= 0 && !right.isSelected) {
                // when user rights are confirm with role rights delete from user rights
                if (index > -1) {
                    $scope.bbcForm.model.rights.splice(index, 1);
                }
            } else {
                // when user rights are not confirm with role rights set user rights to (don't) has access
                if (index > -1) {
                    $scope.bbcForm.model.rights[index].hasAccess = right.isSelected;
                } else {
                    $scope.bbcForm.model.rights.push({_id: right._id, hasAccess: right.isSelected});
                }
            }
        };

        $scope.setListItemStyle = function (r) {
            return r.isSelected ? { 'border-left': '3px solid green' } : null;
        };

        $scope.reset = function (form) {
            $scope.bbcForm.reset(form);
            initRights();
        };

        $bbcTransport.emit(adminModulePath + 'groups/groups/getAll', {options: {sort: {name: 1}, fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.groups = result.items;
            }
        });

        $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', {options: {sort: {name: 1}, fields: ['name', 'description']}}, function (error, result) {
            if (result) {
                $scope.roles = result.items;
            }
        });
    });

