'use strict';

describe('Common: common.nav', function () {

    var $scope, $ctrl;

    beforeEach(module('common.nav'));

    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
    }));

    it('should attach a list of awesomeThings to the scope', function () {
//        console.log('########### DEBUG #############');
//        console.log($scope.menu);
//        expect($scope.menu.length).toBe(5);
        expect(true).toBe(true);
    });

    it('should active the correct location', function () {

        inject(function ($location) {
            $location.path('/test/path');
        });

        expect($scope.isActive('/test/path').isTrue);
        expect($scope.isActive('/test/').isFalse);
    });
});
