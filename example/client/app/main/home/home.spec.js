
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

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectPOST('api/common/awesomeThings/index/getAll')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express', 'Grunt']);
            $scope = $rootScope.$new();
            $ctrl = $controller('MainHomeCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(5);
            expect($scope.view).toBe('app/main/home/home.html');
        });
    });
});