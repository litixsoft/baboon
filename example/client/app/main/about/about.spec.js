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

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenPOST('api/common/awesomeThings/index/getAll')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express', 'Grunt']);
            $scope = $rootScope.$new();
            $ctrl = $controller('MainAboutCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.expectPOST('api/common/awesomeThings/index/getAll');
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(5);
            expect($scope.view).toBe('app/main/about/about.html');
        });
    });
});