'use strict';

describe('Module: admin.groups', function () {

    beforeEach(module('admin'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('admin.groups'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/admin/groups'].controller).toBe('AdminGroupListCtrl');
            expect($route.routes['/admin/groups'].templateUrl).toEqual('app/admin/groups/groups.html');
            expect($route.routes['/admin/groups/edit/:id'].controller).toBe('AdminEditGroupCtrl');
            expect($route.routes['/admin/groups/edit/:id'].templateUrl).toEqual('app/admin/groups/editGroup.html');
            expect($route.routes['/admin/groups/new'].controller).toBe('AdminEditGroupCtrl');
            expect($route.routes['/admin/groups/new'].templateUrl).toEqual('app/admin/groups/editGroup.html');
        });
    });

    describe('AdminGroupListCtrl', function() {
        var $transport, $scope, $ctrl;
        var data = [
            { _id: '1', description: 'The description for Group 1', name: 'Group 1' },
            { _id: '2', description: 'The description for Group 2', name: 'Group 2' },
            { _id: '3', description: 'The description for Group 3', name: 'Group 3' },
            { _id: '4', description: 'The description for Group 4', name: 'Group 4' }
        ];

        beforeEach(module('bbc.form'));
        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    event = null;
                    if(options.options.sort) {
                        callback(null, { items: data, count: data.length });
                    }
                    else {
                        callback({ error: true});
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminGroupListCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect($scope.groups.length).toBe(4);
            expect($scope.count).toBe(4);
        });

        describe('has a function load() which', function () {
            it('should find all items with sorting and paging options', function () {
                $scope.load({ name: 1 }, { skip: 1, limit: 1 });
                expect($scope.groups.length).toBe(4);
                expect($scope.count).toBe(4);
            });
        });

        describe('has a function load() which', function () {
            it('should do nothing with error', function () {
                $scope.groups.length = 0;
                $scope.count = 0;
                $scope.load(null, { skip: 1, limit: 1 });
                expect($scope.groups.length).toBe(0);
                expect($scope.count).toBe(0);
            });
        });
    });

    describe('AdminGroupEditCtrl', function() {
        var $transport, $scope, $ctrl;
        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    if(event === 'api/app/admin/roles/roles/getAll') {
                        callback(null, { items: [{ _id: '1', name: 'Role 1', description: 'Testrole 1' }, { _id: '2', name: 'Role 2', description: 'Testrole 2' }] });
                    }
                    else if(event === 'api/app/admin/groups/groups/getById') {
                        callback(null, { _id: '1', name: 'Group 1', description: 'Testgroup 1' });
                    }
                    else if(event === 'api/app/admin/groups/groups/update') {
                        if(!options.name) {
                            callback({name: 'ValidationError', errors: [{ actual: '', attribute: 'format', expected: 'string', message: 'name is required', property: 'name' }]});
                        }
                        else {
                            callback(null, 1);
                        }
                    }
                    else if(event === 'api/app/admin/groups/groups/create') {
                        options._id = 2;
                        callback(null, options);
                    }
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminEditGroupCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect(typeof $scope.save).toBe('function');
            expect($scope.roles).toBeDefined();
            expect($scope.roles.length).toBe(2);
        });


        describe('has an id param', function() {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditGroupCtrl', { $scope: $scope, $routeParams : routeParams });
                });
            });

            it('should load a group', function() {
                expect($scope.bbcForm.model.name).toBe('Group 1');
                expect($scope.bbcForm.model.description).toBe('Testgroup 1');
            });
        });

        describe('has a function save() which', function () {
            it('should create a new group', function () {
                var group = { name: 'Group 2', description: 'Testgroup 2' };
                $scope.save(group);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe(2);
            });

            it('should update a group', function () {
                var group = { _id: 2, name: 'Group 2', description: 'Testgroup 2' };
                $scope.save(group);
                expect($scope.bbcForm.model).toBeDefined();
                expect($scope.bbcForm.model._id).toBe(2);
            });

            it('should return error on update', function () {
                var group = { _id: 2, description: 'Testgroup 2' };
                $scope.form =  {};
                $scope.save(group);

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.name).toBeDefined();
            });
        });
    });
});
