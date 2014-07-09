'use strict';

describe('Module: main.home.contact', function () {

    // load the controller's module
    beforeEach(module('main'));

    var MainHomeContactCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainHomeContactCtrl = $controller('MainHomeContactCtrl', {
            $scope: scope
        });
    }));

    it('should attach correct vars to the scope', function () {
        expect(scope.view).toBe('contact');
        expect(scope.controller).toBe('MainHomeContactCtrl');
    });
});
