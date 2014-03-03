'use strict';

describe('App: admin', function () {

    beforeEach(module('admin'));

    it('should map routes', function () {

        inject(function ($route) {

            expect($route.routes['/admin'].controller).toBe('AdminCtrl');
            expect($route.routes['/admin'].templateUrl).toEqual('app/admin/admin.html');

            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/admin');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

    describe('Controller: AdminCtrl', function () {

        var $httpBackend, $scope, $ctrl;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

            $httpBackend.whenGET('/locale/admin/locale-en-us.json').respond(200);


            $scope = $rootScope.$new();
            $ctrl = $controller('AdminCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect($scope.awesomeThings.length).toBe(4);
            expect($scope.view).toBe('app/admin/admin.html');
        });

    });
});
