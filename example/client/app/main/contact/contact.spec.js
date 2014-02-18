
'use strict';

describe('Module: main.contact', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('main.contact'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/contact'].controller).toBe('MainContactCtrl');
            expect($route.routes['/contact'].templateUrl).toEqual('app/main/contact/contact.html');
        });
    });

    describe('Controller: MainContactCtrl', function () {

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            $scope = $rootScope.$new();
            $ctrl = $controller('MainContactCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(4);
            expect($scope.view).toBe('app/main/contact/contact.html');
        });
    });
});