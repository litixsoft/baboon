'use strict';

describe('Module: main', function(){
    describe('Controller: MainCtrl', function () {

        // load the controller's module
        beforeEach(module('app'));

        var MainCtrl,
            scope,
            $httpBackend;

        // Initialize the controller and a mock scope
        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            scope = $rootScope.$new();
            MainCtrl = $controller('MainCtrl', {
                $scope: scope
            });
        }));

        it('should attach a list of awesomeThings to the scope', function () {
            expect(scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect(scope.awesomeThings.length).toBe(4);
        });
    });

    describe('Controller: AboutCtrl', function () {

        // load the controller's module
        beforeEach(module('app'));

        var MainCtrl,
            scope,
            $httpBackend;

        // Initialize the controller and a mock scope
        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            scope = $rootScope.$new();
            MainCtrl = $controller('AboutCtrl', {
                $scope: scope
            });
        }));

        it('should attach a list of awesomeThings to the scope', function () {
            expect(scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect(scope.awesomeThings.length).toBe(4);
        });
    });

    describe('Controller: ContactCtrl', function () {

        // load the controller's module
        beforeEach(module('app'));

        var MainCtrl,
            scope,
            $httpBackend;

        // Initialize the controller and a mock scope
        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/api/awesomeThings')
                .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
            scope = $rootScope.$new();
            MainCtrl = $controller('ContactCtrl', {
                $scope: scope
            });
        }));

        it('should attach a list of awesomeThings to the scope', function () {
            expect(scope.awesomeThings).toBeUndefined();
            $httpBackend.flush();
            expect(scope.awesomeThings.length).toBe(4);
        });
    });
});

