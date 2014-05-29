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

    describe('AdminRoleListCtrl', function() {
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
                    if(options.options.sort) {
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
});
