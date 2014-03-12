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

                $transport = $injector.get('transport');
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
    });
});