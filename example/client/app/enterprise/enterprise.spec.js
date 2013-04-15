/*global describe, it, expect, beforeEach, inject */
'use strict';

describe( 'enterprise modul', function() {
    beforeEach( module( 'enterprise' ) );

    // newCtrl tests
    describe('enterprise newCtrl', function() {
        var $newCtrl, $scope;

        beforeEach( inject( function( $controller ) {
            $scope = {};
            $newCtrl = $controller( 'newCtrl', { $scope: $scope});
        }));

        it('should create a empty person', function () {
            expect($scope.person).toBeDefined();
            expect($scope.person.name).toBe('');
            expect($scope.person.description).toBe('');
        });

        it('should have a save function', inject(function () {
            expect(typeof $scope.save).toBe('function');
        }));
    });
});