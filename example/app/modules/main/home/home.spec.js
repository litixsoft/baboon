'use strict';

describe('Module: main.home', function () {

    // load the controller's module
    beforeEach(module('main'));

    var MainHomeCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainHomeCtrl = $controller('MainHomeCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function () {
        expect(scope.awesomeThings.length).toBe(3);
    });
});
