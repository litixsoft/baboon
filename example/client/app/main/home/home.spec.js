
'use strict';

describe('Module: main.home', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('main.home'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/'].controller).toBe('MainHomeCtrl');
            expect($route.routes['/'].templateUrl).toEqual('app/main/home/home.html');
            expect($route.routes['/home'].controller).toBe('MainHomeCtrl');
            expect($route.routes['/home'].templateUrl).toEqual('app/main/home/home.html');
        });
    });

    describe('Controller: MainHomeCtrl', function () {

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
                $ctrl = $controller('MainHomeCtrl', {$scope: $scope});
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBe('test');
            expect($scope.title).toBe('Home');
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
                    $ctrl = $controller('MainHomeCtrl', {$scope: $scope});
                });
            });

            it('should attach empty vars to the scope and log error', function () {
                expect($scope.awesomeThings.length).toBe(0);
                expect(error).toBe('awesomeThings error');
            });
        });
    });
});