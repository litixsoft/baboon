'use strict';

describe('Module: admin.rights', function () {

    beforeEach(module('admin'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('admin.rights'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/admin/rights'].controller).toBe('AdminRightListCtrl');
            expect($route.routes['/admin/rights'].templateUrl).toEqual('app/admin/rights/rights.html');
        });
    });

    describe('AdminRightListCtrl', function() {
        var $transport, $scope, $ctrl;
        var data = [
            { _id: '1', description: 'The description for Right 1', name: 'Right 1' },
            { _id: '2', description: 'The description for Right 2', name: 'Right 2' },
            { _id: '3', description: 'The description for Right 3', name: 'Right 3' },
            { _id: '4', description: 'The description for Right 4', name: 'Right 4' }
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
                $ctrl = $controller('AdminRightListCtrl', { $scope: $scope });
                done();
            });
        });

        it('should be initialized correctly', function () {
            expect($scope.rights.length).toBe(4);
            expect($scope.count).toBe(4);
        });

        describe('has a function load() which', function () {
            it('should find all items with sorting and paging options', function () {
                $scope.load({ name: 1 }, { skip: 1, limit: 1 });
                expect($scope.rights.length).toBe(4);
                expect($scope.count).toBe(4);
            });
        });

        describe('has a function load() which', function () {
            it('should do nothing with error', function () {
                $scope.rights.length = 0;
                $scope.count = 0;
                $scope.load(null, { skip: 1, limit: 1 });
                expect($scope.rights.length).toBe(0);
                expect($scope.count).toBe(0);
            });
        });
    });
});
