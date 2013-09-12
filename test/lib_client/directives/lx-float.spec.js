/*global angular, describe, beforeEach, inject, it, expect */
describe('lxFloat', function () {
    var scope, form;

    beforeEach(module('lx.float'));

    beforeEach(inject(function ($compile, $rootScope) {
        // init scope
        scope = $rootScope.$new();

        var element = angular.element(
            '<form name="form">' +
                '<intput type="text" ng-model="model.val" name="val" lx-float="2" />' +
            '</form>'
        );

        scope.model = {val: 12.34};
        $compile(element)(scope);
        scope.$digest();
        form = scope.form;
    }));

    it('should be initialized correctly', function () {
        expect(scope.model.val).toBe(12.34);
    });

    it('should pass with integer', function() {
        form.val.$setViewValue(1);
        expect(scope.model.val).toEqual(1);
        expect(form.val.$valid).toBe(true);
    });

    it('should pass with float', function() {
        form.val.$setViewValue(4.25);
        expect(scope.model.val).toEqual(4.25);
        expect(form.val.$valid).toBe(true);
    });

    it('should pass with string', function() {
        form.val.$setViewValue('3.25');
        expect(scope.model.val).toEqual(3.25);
        expect(form.val.$valid).toBe(true);
    });

    it('should not pass with date', function() {
        form.val.$setViewValue(new Date());
        expect(scope.model.val).toBeUndefined();
        expect(form.val.$valid).toBe(false);
    });

    it('should not pass with boolean', function() {
        form.val.$setViewValue(true);
        expect(scope.model.val).toBeUndefined();
        expect(form.val.$valid).toBe(false);
    });

    it('should not pass with an array', function() {
        form.val.$setViewValue([1, 2, 3]);
        expect(scope.model.val).toBeUndefined();
        expect(form.val.$valid).toBe(false);
    });

    it('should not pass with an object', function() {
        form.val.$setViewValue({ Value1: 'John', Value2: 'Doe' });
        expect(scope.model.val).toBeUndefined();
        expect(form.val.$valid).toBe(false);
    });

    it('should pass with undefined', function() {
        form.val.$setViewValue(undefined);
        expect(scope.model.val).toBeNull();
        expect(form.val.$valid).toBe(true);
    });

    it('should pass with null', function() {
        form.val.$setViewValue(null);
        expect(scope.model.val).toBeNull();
        expect(form.val.$valid).toBe(true);
    });

    it('should be round a long number', function() {
        form.val.$setViewValue(3.2355);
        expect(scope.model.val).toBe(3.24);
        expect(form.val.$valid).toBe(true);
    });
});