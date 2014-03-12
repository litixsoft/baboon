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

                $transport = $injector.get('transport');
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
    });
});