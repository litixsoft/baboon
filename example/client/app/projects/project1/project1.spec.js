
'use strict';

describe('App: project1', function () {

    beforeEach(module('project1'));

    it('should map routes', function () {

        inject(function ($route) {

            expect($route.routes['/projects/project1'].controller).toBe('Project1Ctrl');
            expect($route.routes['/projects/project1'].templateUrl).toEqual('app/projects/project1/project1.html');

            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/');
        });
    });

    it('should html5 mode', function () {

        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

    describe('Controller: Project1Ctrl', function () {

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            $scope = $rootScope.$new();
            $ctrl = $controller('Project1Ctrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(4);
            expect($scope.view).toBe('app/projects/project1/project1.html');
        });
    });
});
