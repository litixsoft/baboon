/*global describe, it, expect, beforeEach, inject */
'use strict';

describe('session modul', function () {
    beforeEach(module('session'));
    beforeEach(module('lx.session'));

    // newCtrl tests
    describe('session sessionCtrl', function () {
        var sessionCtrl, scope;

        beforeEach(inject(function ($controller) {
            scope = {};
            sessionCtrl = $controller('sessionCtrl', { $scope: scope});
        }));

        it('should pass a dummy test', inject(function () {
            expect(sessionCtrl).toBeTruthy();
        }));
    });
});