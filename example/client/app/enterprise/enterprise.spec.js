/*global describe, it, expect, beforeEach, inject */
'use strict';

describe( 'enterprise modul', function() {
    beforeEach( module( 'enterprise' ) );

    // newCtrl tests
    describe('enterprise newCtrl', function() {
        var newCtrl, scope;

        beforeEach( inject( function( $controller ) {
            scope = {};
            newCtrl = $controller( 'newCtrl', { $scope: scope});
        }));

        it('should create a empty person', inject(function () {
            expect(scope.person).toBeDefined();
            expect(scope.person.name).toBe('');
            expect(scope.person.description).toBe('');
        }));

        it('should have a save function', inject(function () {
            expect(typeof scope.save).toBe('function');
        }));

        it( 'should pass a dummy test', inject( function() {
            expect( newCtrl ).toBeTruthy();
        }));
    });

    // newCtrl tests
    describe('enterprise editCtrl', function() {

        it( 'should pass a dummy test', inject( function() {
            expect( true ).toBeTruthy();
        }));
    });
});