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
});
