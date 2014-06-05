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
                    event = null;
                    if(options.options.sort) {
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
    });

    describe('AdminEditUserCtrl', function() {
        var $transport, $scope, $ctrl;
        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {
                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, options, callback) {
                    if (event === 'api/app/admin/users/users/getById') {
                        callback(null, { _id: '1', name: 'User 1', email: 'a@b.c'});
                    }
                    else if (event === 'api/app/admin/roles/roles/getAll') {
                        callback(null, {items: [{ _id: '1', name: 'Role 1', description: 'Testrole 1' }, { _id: '2', name: 'Role 2', description: 'Testrole 2' }], count: 2});
                    }
                    else if (event === 'api/app/admin/groups/groups/getAll') {
                        callback(null, {items: [{ _id: '1', name: 'Group 1', description: 'Testgroup 1' }, { _id: '2', name: 'Group 2', description: 'Testgroup 2' }], count: 2});
                    }
//                    else if (event === 'api/app/admin/rights/rights/getAll') {
//                        callback(null, {items: [{ _id: '1', name: 'Right 1', description: 'Testright 1' }, { _id: '2', name: 'Right 2', description: 'Testright 2' }], count: 2});
//                    }
                    else if (event === 'api/app/admin/groups/groups/getByIds') {
                        callback(null, {items: [{ _id: '1', name: 'Group 1 Id', description: 'Testgroup 1 Id' }, { _id: '2', name: 'Group 2 Id', description: 'Testgroup 2 Id' }], count: 2});
                    }
                    else if (event === 'api/app/admin/roles/roles/getByIds') {
                        callback(null, {items: [{ _id: '1', name: 'Role 1 Id', description: 'Testrole 1 Id' }, { _id: '2', name: 'Role 2 Id', description: 'Testrole 2 Id' }], count: 2});
                    }
                    else if (event === 'api/app/admin/users/users/update') {
                        callback(null, 1);
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

//        afterEach(function(){
//            $rootScope.$apply();
//        });

        it('should be initialized correctly', function () {
            expect(typeof $scope.save).toBe('function');
            expect($scope.roles).toBeDefined();
            expect($scope.roles.length).toBe(2);
        });

        describe('has an id param', function() {
            beforeEach(function () {
                inject(function ($controller) {
                    var routeParams = { id: '1' };
                    $ctrl = $controller('AdminEditUserCtrl', { $scope: $scope, $routeParams : routeParams });
                });
            });

            it('should load a user', function() {
                expect($scope.bbcForm.model.name).toBe('User 1');
                expect($scope.bbcForm.model.email).toBe('a@b.c');
            });
        });


    });
});
