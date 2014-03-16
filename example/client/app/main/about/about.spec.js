'use strict';



describe('Module: main.about', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('main.about'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/about'].controller).toBe('MainAboutCtrl');
            expect($route.routes['/about'].templateUrl).toEqual('app/main/about/about.html');
        });
    });

    describe('Controller: MainAboutCtrl', function () {

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
                $ctrl = $controller('MainAboutCtrl', {$scope: $scope});
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBe('test');
            expect($scope.title).toBe('About');
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
                    $ctrl = $controller('MainAboutCtrl', {$scope: $scope});
                });
            });

            it('should attach empty vars to the scope and log error', function () {
                expect($scope.awesomeThings.length).toBe(0);
                expect(error).toBe('awesomeThings error');
            });
        });
    });
});