'use strict';

describe('Module: main.home.about', function () {

    // load the controller's module
    beforeEach(module('main'));

    var MainHomeAboutCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainHomeAboutCtrl = $controller('MainHomeAboutCtrl', {
            $scope: scope
        });
    }));

    it('should attach correct vars to the scope', function () {
        expect(scope.view).toBe('about');
        expect(scope.controller).toBe('MainHomeAboutCtrl');
    });
});
