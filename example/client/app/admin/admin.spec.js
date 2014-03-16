'use strict';

describe('App: admin', function () {

    beforeEach(module('admin'));
    beforeEach(module('bbc.transport'));

    it('should map routes', function () {

        inject(function ($route) {

            expect($route.routes['/admin'].controller).toBe('AdminCtrl');
            expect($route.routes['/admin'].templateUrl).toEqual('app/admin/admin.html');

            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/admin');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

    describe('Controller: AdminCtrl', function () {

        var $transport, $scope, $ctrl;

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, callback) {
                    event = null;
                    callback(null, 'test');
                    done();
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminCtrl', {$scope: $scope});
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBe('test');
        });

        describe('test error in awesomeThings', function(){

            var error;

            beforeEach(function (done) {
                inject(function ($controller, $rootScope, $injector, $log) {

                    $log.error = function(msg){
                        error = msg;
                    };
                    $transport = $injector.get('$bbcTransport');
                    $transport.emit = function (event, callback) {
                        event = null;
                        callback('awesomeThings error');
                        done();
                    };

                    $scope = $rootScope.$new();
                    $ctrl = $controller('AdminCtrl', {$scope: $scope});
                });
            });

            it('should attach empty vars to the scope and log error', function () {
                expect($scope.awesomeThings.length).toBe(0);
                expect(error).toBe('awesomeThings error');
            });
        });
    });
});
