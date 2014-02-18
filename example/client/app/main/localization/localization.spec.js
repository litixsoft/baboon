'use strict';

describe('Module: main.localization', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(module('main.localization'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes['/localization'].controller).toBe('MainLocalizationCtrl');
            expect($route.routes['/localization'].templateUrl).toEqual('app/main/localization/localization.html');
        });
    });

    describe('Controller: MainLocalizationCtrl', function () {

        var $scope, $ctrl, translate;

        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, $translate) {
            translate = $translate;
            translate.uses('en-us');
            $scope = $rootScope.$new();
            $ctrl = $controller('MainLocalizationCtrl', {$scope: $scope});
        }));

        it('should attach vars to the scope', function () {
            expect($scope.sampleDate).toBeDefined();
            expect($scope.sampleNumber).toBeDefined();
            expect($scope.sampleCurrency).toBeDefined();
        });

        it('should change the language', function() {
            runs(function() {
                expect(translate.uses()).toBe('en-us');
                $scope.changeLanguage('de-de');
            });

            runs(function() {
                expect(translate.uses()).toBe('de-de');
            });
        });
    });
});