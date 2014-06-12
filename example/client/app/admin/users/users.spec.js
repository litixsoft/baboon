'use strict';

describe('Module: admin.users', function () {

    beforeEach(module('admin'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('admin.users'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/admin/users'].controller).toBe('AdminUserListCtrl');
            expect($route.routes['/admin/users'].templateUrl).toEqual('app/admin/users/users.html');
            expect($route.routes['/admin/users/edit/:id'].controller).toBe('AdminEditUserCtrl');
            expect($route.routes['/admin/users/edit/:id'].templateUrl).toEqual('app/admin/users/editUser.html');
            expect($route.routes['/admin/users/new'].controller).toBe('AdminEditUserCtrl');
            expect($route.routes['/admin/users/new'].templateUrl).toEqual('app/admin/users/editUser.html');
        });
    });

    describe('AdminUserListCtrl', function() {
        var $transport, $scope, $ctrl;
        var data = [
            { _id: '1', display_name: 'User 1', name: 'User1' },
            { _id: '2', display_name: 'User 2', name: 'User2' },
            { _id: '3', display_name: 'User 3', name: 'User3' },
            { _id: '4', display_name: 'User 4', name: 'User4' }
        ];

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    if (event === 'api/app/admin/users/users/remove') {
                        if (options.id === 1) {
                            callback(null, 1);
                        }
                        else if (options.id === 2) {
                            callback({name: 'ControllerError', message: 'internal test error' });
                        }
                        else {
                            callback({name: 'Error', message: 'generic test error' });
                        }
                    }
                    else if (options.options.sort) {
                        callback(null, { items: data, count: data.length });
                    }
                    else {
                        callback({ error: true});
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminUserListCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect($scope.users.length).toBe(4);
            expect($scope.count).toBe(4);
        });

        describe('has a function load() which', function () {
            it('should find all items with sorting and paging options', function () {
                $scope.load({ name: 1 }, { skip: 1, limit: 1 });
                expect($scope.users.length).toBe(4);
                expect($scope.count).toBe(4);
            });
        });

        describe('has a function load() which', function () {
            it('should do nothing with error', function () {
                $scope.users.length = 0;
                $scope.count = 0;
                $scope.load(null, { skip: 1, limit: 1 });
                expect($scope.users.length).toBe(0);
                expect($scope.count).toBe(0);
            });
        });

        describe('has a function closeAlert() which', function () {
            it('should close an alert', function () {
                $scope.alerts = [
                    {type: 'danger', msg: 'error'}
                ];
                $scope.closeAlert(0);
                expect($scope.alerts.length).toBe(0);
            });
        });

        describe('has a function remove', function () {
            var options = null;

            beforeEach(function (done) {
                inject(function ($controller, _$rootScope_, _$httpBackend_, $translate, $q) {
                    $translate = function () {
                        var deferred = $q.defer();
                        deferred.resolve({ 'DELETE': 'delete', 'DELETE_MSG': 'the delete message', 'YES': 'yes', 'NO': 'no' });
                        return deferred.promise;
                    };

                    _$httpBackend_.whenGET('/locale/admin/locale-en-us.json').respond(200, {
                        DELETE: 'delete',
                        DELETE_MSG: 'the delete message',
                        YES: 'yes',
                        NO: 'no'
                    });
                    var modal = {};
                    modal.open = function (popUpOptions) {
                        options = popUpOptions;
                        popUpOptions.callObj.cbYes();
                    };

                    $scope = _$rootScope_.$new();
                    $ctrl = $controller('AdminUserListCtrl', { $rootScope: _$rootScope_, $scope: $scope, $bbcModal: modal, $translate: $translate });
                });
                done();
            });

            it('should remove a group', function () {
                $scope.alerts = [];
                $scope.remove(1);
                expect($scope.alerts.length).toBe(0);
            });

            it('should throw a controller error', function () {
                $scope.alerts = [];
                $scope.remove(2);
                expect($scope.alerts.length).toBe(1);
            });

            it('should throw an error', function () {
                $scope.alerts = [];
                $scope.remove(3);
                expect($scope.alerts.length).toBe(1);
            });

            it('should raise the $translateChangeSuccess event', function () {
                inject(function ($rootScope) {
                    $scope.$digest();
                    $rootScope.$broadcast('$translateChangeSuccess');
                    $scope.remove(1);
                    expect(options).not.toBeNull();
                    expect(options.buttonTextValues).toBeDefined();
                    expect(options.buttonTextValues.yes).toBeDefined();
                    expect(options.buttonTextValues.no).toBeDefined();
                    expect(options.buttonTextValues.yes).toBe('yes');
                    expect(options.buttonTextValues.no).toBe('no');
                });
            });
        });
    });

    describe('AdminEditUserCtrl', function() {
        var $transport, $scope, $ctrl;
        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {
                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    if (event === 'api/app/admin/users/users/getUserData') {
                        callback(null, {
                            user: { _id: '1', name: 'guest', email: 'a@b.c', rights: [{_id: '2', hasAccess: false}], groups: ['1', '2'], roles: ['1']},
                            groups: [
                                { _id: '1', name: 'Guest', description: 'Testgroup 1', roles: ['1', '2']},
                                { _id: '2', name: 'Group 2', description: 'Testgroup 2', roles: ['1'] }
                            ],
                            roles: [
                                { _id: '1', name: 'User', description: 'Userrole', rights: ['2'] },
                                { _id: '2', name: 'Role 2', description: 'Testrole 2' },
                                { _id: '3', name: 'Guest', description: 'Guestrole', rights: ['1'] }
                            ],
                            rights: [
                                { _id: '1', name: 'Right 1', description: 'Testright 1' },
                                { _id: '2', name: 'Right 2', description: 'Testright 2' }
                            ]
                        });
                    }
                    else if (event === 'api/app/admin/users/users/update') {
                        if (options.name) {
                            callback(null, 1);
                        }
                        else if (options.description) {
                            callback({name: 'ValidationError', errors: [
                                { actual: '', attribute: 'format', expected: 'string', message: 'name is required', property: 'name' }
                            ]});
                        } else {
                            callback({name: 'Error', errors: [{desc: 'NonValidationError'}]});
                        }
                    }
                    else if (event === 'api/app/admin/users/users/create') {
                        callback(null, { _id: '2', name: 'User 2', email: 'b@c.d'});
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect(typeof $scope.save).toBe('function');
            expect($scope.roles).toBeDefined();
            expect($scope.roles.length).toBe(3);
        });

        describe('initializ a new user which', function () {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = {};
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams: routeParams });
                });
            });

            it('should get preseleted roles', function () {
                expect($scope.bbcForm.model.roles).toEqual(['1', '3']);
            });
        });

        describe('has an id param', function() {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams : routeParams });
                });
            });

            it('should load a user', function() {
                expect($scope.bbcForm.model.name).toBe('guest');
                expect($scope.bbcForm.model.email).toBe('a@b.c');
            });

            it('should not load a user', function () {
                var routeParams = { id: -1 };
                inject(function ($controller) {
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams: routeParams });
                });
                expect($scope.bbcForm.model.id).not.toBeDefined();
            });
        });

        describe('has a function save() which', function () {
            it('should create a new user', function () {
                var user = { name: 'User 2', description: 'a@b.c' };
                $scope.save(user);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe('2');
            });

            it('should update a user', function () {
                var user = { _id: '2', name: 'User 2', description: 'Testuser 2' };
                $scope.save(user);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe('2');
            });

            it('should return validation error on update', function () {
                var user = { _id: 2, description: 'Testuser 2' };
                $scope.form = {};
                $scope.save(user);

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.name).toBeDefined();
            });

            it('should return error on update', function () {
                var user = { _id: 2 };
                $scope.form = {};
                $scope.save(user);

                expect($scope.form.errors).toBeDefined();
            });
        });

        describe('has a function setListItemStyle() which', function () {
            it('should return null', function () {
                var result = $scope.setListItemStyle({isSelected: false});

                expect(result).toBeNull();
            });

            it('should return a valid style', function () {
                var result = $scope.setListItemStyle({isSelected: true});

                expect(result['border-left']).toBeDefined();
                expect(result['border-left']).toBe('3px solid green');
            });
        });

        describe('has a function reset() which', function () {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams : routeParams });
                });
            });

            it('reset model',  function () {
                var form = {value: 'old', $setPristine: function(){}};
                $scope.bbcForm.setModel(form);
                $scope.bbcForm.model.value = 'new';
                expect($scope.bbcForm.model.value).toBe('new');

                $scope.reset($scope.bbcForm.model);
                expect($scope.bbcForm.model.value).toBe('old');
            });

            it('init the rights new', function() {
                $scope.bbcForm.model.$setPristine = function(){};
                $scope.bbcForm.setModel($scope.bbcForm.model);
                $scope.reset($scope.bbcForm.model);


            });
        });

        describe('has a function isPasswordConfirmed() which', function () {
            it('should return true', function () {
                $scope.bbcForm.model.password = '*#pA$$W0rD#*';
                $scope.bbcForm.model.confirmed_password = '*#pA$$W0rD#*';
                var result = $scope.isPasswordConfirmed();

                expect(result).toBeTruthy();
            });

            it('should return false', function () {
                $scope.bbcForm.model.password = '*#pA$$W0rD#*';
                $scope.bbcForm.model.confirmed_password = 'another Word';
                var result = $scope.isPasswordConfirmed();

                expect(result).toBeFalsy();
            });
        });

        describe('has a function setRight() which', function () {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams: routeParams });
                });
            });

            it('should set and unset a right', function () {
                var right = {_id: '1', source: [], isSelected: true};
                $scope.setRight(right);

                expect($scope.bbcForm.model.rights).toEqual([{_id: '2', hasAccess: false}, {_id: '1', hasAccess: true}]);

                right.isSelected = false;
                $scope.setRight(right);

                expect($scope.bbcForm.model.rights).toEqual([{_id: '2', hasAccess: false}]);

            });

            it('should unset a right', function () {
                var right = {_id: '2', source: ['User'], isSelected: false};
                $scope.setRight(right);

                expect($scope.bbcForm.model.rights).toEqual([{_id: '2', hasAccess: false}]);
            });
        });
    });
});
