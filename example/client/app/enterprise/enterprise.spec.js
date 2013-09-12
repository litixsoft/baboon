/*global describe, it, expect, beforeEach, inject */
'use strict';

describe('enterprise modul', function () {
    beforeEach(module('enterprise'));
    beforeEach(module('mocks'));

    // newCtrl tests
    describe('enterprise newCtrl', function () {
        var newCtrl, scope;

        beforeEach(inject(function ($controller) {
            scope = {};
            newCtrl = $controller('newCtrl', { $scope: scope});
        }));

        it('should create a empty person', inject(function () {
            expect(scope.person).toBeDefined();
            expect(scope.person.name).toBe('');
            expect(scope.person.description).toBe('');
        }));

        it('should have a save function', inject(function () {
            expect(typeof scope.save).toBe('function');

            scope.save();
        }));

        it('should pass a dummy test', inject(function () {
            expect(newCtrl).toBeTruthy();
        }));
    });

    // editCtrl tests
    describe('enterprise editCtrl', function () {
        var scope, editCtrl;

        beforeEach(inject(function ($controller, $routeParams) {
            scope = {};
            $routeParams.id = 0;
            editCtrl = $controller('editCtrl', { $scope: scope });
        }));

        it('should have a save function', inject(function () {
            expect(typeof scope.save).toBe('function');

            scope.save();
        }));

        it('should pass a dummy test', inject(function () {
            expect(editCtrl).toBeTruthy();
            expect(scope.person).toBeUndefined();
        }));
    });

    // enterprise ctrl tests
    describe('enterpriseCtrl', function () {
        var ctrl, scope;

        beforeEach(inject(function ($controller) {
            scope = {};
            ctrl = $controller('enterpriseCtrl', { $scope: scope});
        }));

        it('should have some data', inject(function () {
            expect(typeof scope.enterpriseCrew).toBe('object');
            expect(Object.keys(scope.enterpriseCrew).length).toBe(0);
            expect(scope.shouldBeOpen).toBeUndefined();
            expect(scope.closeMsg).toBeUndefined();
            expect(Array.isArray(scope.items)).toBeTruthy();
            expect(scope.items.length).toBe(2);
            expect(scope.items[0]).toBe('item1');
            expect(scope.items[1]).toBe('item2');
            expect(scope.opts).toBeDefined();
            expect(scope.opts.backdropFade).toBeTruthy();
            expect(scope.opts.dialogFade).toBeTruthy();
        }));

        it('should have a open function', inject(function () {
            expect(typeof scope.open).toBe('function');

            scope.open();

            expect(scope.shouldBeOpen).toBeTruthy();
        }));

        it('should have a close function', inject(function () {
            expect(typeof scope.close).toBe('function');

            scope.close();

            expect(scope.shouldBeOpen).toBeFalsy();
            expect(typeof scope.closeMsg).toBe('string');
        }));

        it('should pass a dummy test', inject(function () {
            expect(ctrl).toBeTruthy();
        }));
    });
});