'use strict';

describe('Module: admin.roles', function () {

    beforeEach(module('admin'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('admin.roles'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/admin/roles'].controller).toBe('AdminRoleListCtrl');
            expect($route.routes['/admin/roles'].templateUrl).toEqual('app/admin/roles/roles.html');
            expect($route.routes['/admin/roles/edit/:id'].controller).toBe('AdminEditRoleCtrl');
            expect($route.routes['/admin/roles/edit/:id'].templateUrl).toEqual('app/admin/roles/editRole.html');
            expect($route.routes['/admin/roles/new'].controller).toBe('AdminEditRoleCtrl');
            expect($route.routes['/admin/roles/new'].templateUrl).toEqual('app/admin/roles/editRole.html');
        });
    });

    describe('AdminRoleListCtrl', function () {
        var $transport, $scope, $ctrl;
        var data = [
            { _id: '1', description: 'The description for Role 1', name: 'Role 1' },
            { _id: '2', description: 'The description for Role 2', name: 'Role 2' },
            { _id: '3', description: 'The description for Role 3', name: 'Role 3' },
            { _id: '4', description: 'The description for Role 4', name: 'Role 4' }
        ];

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    event = null;
                    if (options.options.sort) {
                        callback(null, { items: data, count: data.length });
                    }
                    else {
                        callback({ error: true});
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminRoleListCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect($scope.roles.length).toBe(4);
            expect($scope.count).toBe(4);
        });

        describe('has a function load() which', function () {
            it('should find all items with sorting and paging options', function () {
                $scope.load({ name: 1 }, { skip: 1, limit: 1 });
                expect($scope.roles.length).toBe(4);
                expect($scope.count).toBe(4);
            });
        });

        describe('has a function load() which', function () {
            it('should do nothing with error', function () {
                $scope.roles.length = 0;
                $scope.count = 0;
                $scope.load(null, { skip: 1, limit: 1 });
                expect($scope.roles.length).toBe(0);
                expect($scope.count).toBe(0);
            });
        });
    });

    describe('AdminEditRoleCtrl', function () {
        var $transport, $scope, $ctrl;
        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    if ('api/app/admin/rights/rights/getAll' === event) {
                        callback(null, { items: [
                            { _id: '1', name: 'Right 1', description: 'Testright 1' },
                            { _id: '2', name: 'Right 2', description: 'Testright 2' }
                        ] });
                    }
                    else if ('api/app/admin/roles/roles/getById' === event) {
                        callback(null, { _id: '1', name: 'Role 1', description: 'Testrole 1' });
                    }
                    else if ('api/app/admin/roles/roles/update' === event) {
                        if (!options.name) {
                            callback({name: 'ValidationError', errors: [
                                { actual: '', attribute: 'format', expected: 'string', message: 'name is required', property: 'name' }
                            ]});
                        }
                        else {
                            callback(null, 1);
                        }
                    }
                    else if ('api/app/admin/roles/roles/create' === event) {
                        options._id = 2;
                        callback(null, options);
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminEditRoleCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect(typeof $scope.save).toBe('function');
            expect(typeof $scope.setStyle).toBe('function');
        });

/*        describe('has an id param', function () {
            beforeEach(function () {
                inject(function ($controller, _$q_) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditRoleCtrl', { $scope: $scope, $routeParams: routeParams });

                    var deferred = _$q_.defer();
                    deferred.resolve({ _id: '1', name: 'Role 1', description: 'Testrole 1' });
                    spyOn($ctrl, 'loadRole').andReturn(deferred.promise);
                });
            });

            it('should load a role', function () {
                expect($scope.bbcForm.model.name).toBe('Role 1');
                expect($scope.bbcForm.model.description).toBe('Testrole 1');
            });
        });*/

        describe('has a function save() which', function () {
            it('should create a new role', function () {
                var group = { name: 'Role 2', description: 'Testrole 2' };
                $scope.save(group);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe(2);
            });

            it('should update a role', function () {
                var group = { _id: 2, name: 'Role 2', description: 'Testrole 2' };
                $scope.save(group);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe(2);
            });

            it('should return error on update', function () {
                var group = { _id: 2, description: 'Testrole 2' };
                $scope.form = {};
                $scope.save(group);

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.name).toBeDefined();
            });
        });

        describe('has a function setStyle() which', function () {
            it('should return null', function () {
                var result = $scope.setStyle({checked: false});

                expect(result).toBeNull();
            });

            it('should return a valid style', function () {
                var result = $scope.setStyle({checked: true});

                expect(result['border-left']).toBeDefined();
                expect(result['border-left']).toBe('3px solid green');
            });
        });
    });
});
