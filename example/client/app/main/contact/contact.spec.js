'use strict';

describe('Module: main.contact', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('main.contact'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/contact'].controller).toBe('MainContactCtrl');
            expect($route.routes['/contact'].templateUrl).toEqual('app/main/contact/contact.html');
        });
    });

    describe('Controller: MainContactCtrl', function () {

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
                $ctrl = $controller('MainContactCtrl', {$scope: $scope});
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBe('test');
            expect($scope.title).toBe('Contact');
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
                    $ctrl = $controller('MainContactCtrl', {$scope: $scope});
                });
            });

            it('should attach empty vars to the scope and log error', function () {
                expect($scope.awesomeThings.length).toBe(0);
                expect(error).toBe('awesomeThings error');
            });
        });
    });
});