/*global describe, it, expect, beforeEach, inject */
'use strict';

var filter, sut;

describe('blog filters', function () {
    beforeEach(module('blog.filters'));

    describe('notZero', function () {
        beforeEach(function () {
            inject(function ($filter) {
                filter = $filter;
            });
        });

        it('should filter out tags where the count is zero', function () {
            sut = filter('notZero');
            var data = [
                {name: 'angular', count: 3},
                {name: 'node.js', count: 4},
                {name: 'ember.js', count: 0},
                {name: 'backbone', count: -4}
            ];
            var res = sut(data);

            expect(res.length).toBe(2);
            expect(res[0].name).toBe('angular');
            expect(res[1].name).toBe('node.js');
        });

        it('should filter out tags where the count is zero', function () {
            sut = filter('notZero');
            var res = sut();

            expect(res.length).toBe(0);
        });
    });
});