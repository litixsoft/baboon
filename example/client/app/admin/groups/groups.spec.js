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
});
