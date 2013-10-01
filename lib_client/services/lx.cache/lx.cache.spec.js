/*global describe, it, expect, beforeEach, inject, module */
'use strict';

describe('lx.cache', function () {
    var service;

    beforeEach(function () {
        module('lx.cache');

        inject(function ($injector) {
            service = $injector.get('lxCache');
        });
    });

    it('should be initialized correctly ', function () {
        expect(typeof service).toBe('object');
        expect(Object.keys(service).length).toBe(0);
    });

    it('should cache data', function () {
        var data = {
            name: 'wayne',
            age: 90
        };

        service.test = 1;
        service.obj = data;

        data.age = 10;

        expect(service.test).toBe(1);
        expect(service.obj).toEqual({name: 'wayne', age: 10});

        inject(function ($injector) {
            var serviceRef = $injector.get('lxCache');

            expect(serviceRef.test).toBe(1);
            expect(serviceRef.obj).toEqual({name: 'wayne', age: 10});
        });
    });
});