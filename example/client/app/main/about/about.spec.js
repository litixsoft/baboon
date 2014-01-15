
'use strict';

describe('Module: example.about', function () {

    beforeEach(module('example'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/about'].controller).toBe('ExampleAboutCtrl');
            expect($route.routes['/about'].templateUrl).toEqual('app/main/about/about.html');
        });
    });

    describe('Controller: ExampleAboutCtrl', function () {

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            $scope = $rootScope.$new();
            $ctrl = $controller('ExampleAboutCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(4);
            expect($scope.view).toBe('main/about/about');
        });
    });
});