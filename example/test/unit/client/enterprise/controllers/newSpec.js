/*global describe, it, expect, beforeEach, NewCtrl */
describe('NewCtrl', function () {
    'use strict';

    console.dir('asdadasda');

    var scope, ctrl;

    beforeEach(function () {
        scope = {};
        ctrl = new NewCtrl(scope);
    });

    it('should create a empty person', function () {
        expect(scope.person).toBeDefined();
        expect(scope.person.name).toBe('');
        expect(scope.person.description).toBe('');
    });

    it('should have a save function', function () {
        expect(typeof scope.save).toBe('function');
    });
});
