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

        var header = 'Del';
        var msg = 'Del';
        var btnTextValues = { yes: 'j', no: 'n' };

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

        $scope.load = function (sort, page) {
            $scope.pagingOptions = page;
            $scope.sortOpts = sort;
            getData();
        };

        $scope.alerts = [];
        $scope.remove = function(id, name) {
            $scope.alerts.length = 0;
            header = header + ' ' + name;
            var options = { id: 'deleteUser', message: msg, headline: header, backdrop: false, buttonTextValues: btnTextValues };
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
    .controller('AdminEditUserCtrl', function ($scope, $routeParams, $location, $bbcForm, $bbcTransport, $log, adminModulePath) {
        $scope.bbcForm = $bbcForm('baboon_right', '_id');

        $scope.popupDelay = 800;

        $scope.filterStates = [
            {key: 'SHOW_ALL', filter: {}},
            {key: 'SHOW_IGNORE', filter: {isAllowed: false, isForbidden: false}},
            {key: 'SHOW_ALLOW', filter: {isAllowed: true, isForbidden: false}},
            {key: 'SHOW_FORBIDDEN', filter: {isAllowed: false, isForbidden: true}}
        ];
        $scope.filterState = $scope.filterStates[0];

        $scope.languages = [
            {key: 'GERMAN', value: 'de-de'},
            {key: 'ENGLISH', value: 'en-us'}
        ];

        $scope.isPasswordConfirmed = function () {
            return $scope.bbcForm.model.password === $scope.bbcForm.model.confirmed_password;
        };

        if (!$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(adminModulePath + 'users/users/getById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    delete result.register_date;

                    if (result.name === 'guest') {
                        result.isGuest = true;
                    }

                    $scope.bbcForm.setModel(result);
                } else {
                    $log.log(error);
                }
            });
        } else if (!$routeParams.id) {
            // set default guest role for new user
            $scope.bbcForm.model.roles = [];
            $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', {params: {name: 'Guest'}, options: {fields: ['_id']}}, function (error, result) {
                if (result && result.items && result.items.length > 0) {
                    $scope.bbcForm.model.roles.push(result.items[0]._id);
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

//        var initRights = function (allRights, selectedRights) {
//            var extractHasAccessId = function (e) {
//                return e.hasAccess ? e._id : null;
//            };
//
//            var extractForbiddenAccessId = function (e) {
//                return e.hasAccess ? null : e._id;
//            };
//
//            if (angular.isArray(allRights)) {
//                for (var i = 0; i < allRights.length; i++) {
//                    var hasAccess = selectedRights.map(extractHasAccessId).indexOf(allRights[i]._id) > -1;
//                    var forbiddenAccess = selectedRights.map(extractForbiddenAccessId).indexOf(allRights[i]._id) > -1;
//
//                    allRights[i].isAllowed = hasAccess || false;
//                    allRights[i].isForbidden = forbiddenAccess || false;
//                }
//            }
//        };

//        var initRights = function (allRights, selectedRights, rolesRights) {
//            if (angular.isArray(allRights)) {
//                for (var i = 0; i < allRights.length; i++) {
//                    allRights[i].source = allRights[i].source || [];
//
//                    for (var j = 0; j < rolesRights.items.length; j++) {
//                        for (var k = 0; k < rolesRights.rights.length; k++) {
//                            if (allRights[i]._id === rolesRights[j].items.rights[k]._id) {
//                                allRights[i].source.push(rolesRights[j].name);
//                            }
//                        }
//                    }
//                }
//                console.log('###', rolesRights, allRights);
//            }
//        };

        $bbcTransport.emit(adminModulePath + 'rights/rights/getAll', function (error, result) {
            if (result) {
                $scope.rights = result.items;
//                $scope.bbcForm.model.rights = $scope.bbcForm.model.rights || [];
//                $scope.bbcForm.model.roles = $scope.bbcForm.model.roles || [];
//
//                $bbcTransport.emit(adminModulePath + 'roles/roles/getAll', {params: {_id: {$in: $scope.bbcForm.model.roles}}}, function (error, result) {
//                    if (result) {
//                        $scope.userRolesDetails = result || [];
//                        initRights($scope.rights, $scope.bbcForm.model.rights, $scope.userRolesDetails);
//                    }
//                });
            }
        });

        var extractId = function (e) {
            return e._id;
        };

        var initRights = function (allRights, selectedRights) {
            var extractHasAccessId = function (e) {
                return e.hasAccess ? e._id : null;
            };

            var extractForbiddenAccessId = function (e) {
                return e.hasAccess ? null : e._id;
            };

            if (angular.isArray(allRights)) {
                for (var i = 0; i < allRights.length; i++) {
                    var hasAccess = selectedRights.map(extractHasAccessId).indexOf(allRights[i]._id) > -1;
                    var forbiddenAccess = selectedRights.map(extractForbiddenAccessId).indexOf(allRights[i]._id) > -1;

                    allRights[i].isAllowed = hasAccess || false;
                    allRights[i].isForbidden = forbiddenAccess || false;
                }
            }
        };

        $scope.setRight = function (right) {
            var index = $scope.bbcForm.model.rights.map(extractId).indexOf(right._id);

            if (right.isAllowed && right.isForbidden) {
                if (index > -1) {
                    $scope.bbcForm.model.rights[index].hasAccess = !$scope.bbcForm.model.rights[index].hasAccess;
                    right.isAllowed = $scope.bbcForm.model.rights[index].hasAccess;
                    right.isForbidden = !$scope.bbcForm.model.rights[index].hasAccess;
                } else {
                    right.isAllowed = false;
                    right.isForbidden = false;
                }
            } else if (right.isAllowed !== right.isForbidden) {
                if (index > -1) {
                    $scope.bbcForm.model.rights[index].hasAccess = right.isAllowed;
                } else {
                    $scope.bbcForm.model.rights.push({_id: right._id, hasAccess: right.isAllowed});
                }
            } else /*if (!right.isAllowed && !right.isForbidden)*/ {
                if (index > -1) {
                    $scope.bbcForm.model.rights.splice(index, 1);
                }
            }
        };

        $scope.setListItemStyle = function (r) {
            for (var i = 0; $scope.bbcForm.model.rights && i < $scope.bbcForm.model.rights.length; i++) {
                if ($scope.bbcForm.model.rights[i]._id === r._id) {
                    if (r.isAllowed) {
                        return { 'border-left': '3px solid green' };
                    } else if (r.isForbidden) {
                        return { 'border-left': '3px solid red' };
                    }
                }
            }
            return null;
        };

        $scope.setAllowIconStyle = function (r) {
            for (var i = 0; $scope.bbcForm.model.rights && i < $scope.bbcForm.model.rights.length; i++) {
                if ($scope.bbcForm.model.rights[i]._id === r._id) {
                    if (r.isAllowed) {
                        return { 'border': '3px solid green' };
                    }
                }
            }
            return null;
        };

        $scope.setForbiddenIconStyle = function (r) {
            for (var i = 0; $scope.bbcForm.model.rights && i < $scope.bbcForm.model.rights.length; i++) {
                if ($scope.bbcForm.model.rights[i]._id === r._id) {
                    if (r.isForbidden) {
                        return { 'border': '3px solid red' };
                    }
                }
            }
            return null;
        };

        $scope.reset = function (form) {
            $scope.bbcForm.reset(form);
            initRights($scope.rights, $scope.bbcForm.model.rights);
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

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

    });

