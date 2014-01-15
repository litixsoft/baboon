
'use strict';

describe('Module: example.contact', function () {

    beforeEach(module('example'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/contact'].controller).toBe('ExampleContactCtrl');
            expect($route.routes['/contact'].templateUrl).toEqual('app/main/contact/contact.html');
        });
    });

    describe('Controller: ExampleContactCtrl', function () {

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            $scope = $rootScope.$new();
            $ctrl = $controller('ExampleContactCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(4);
            expect($scope.view).toBe('main/contact/contact');
        });
    });
});