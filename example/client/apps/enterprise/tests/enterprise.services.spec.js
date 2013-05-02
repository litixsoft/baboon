/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('enterprise services', function () {
    var service;

    beforeEach(function () {
        module('mocks');
        module('enterprise.services');
        inject(function ($injector) {
            service = $injector.get('enterpriseCrew');
        });
    });

    it('should be defined', function () {
        expect(service).toBeDefined();
        expect(service.enterprise).toBeUndefined();
    });

    it('should have some functions', function () {
        expect(typeof service.getAll).toBe('function');
        expect(typeof service.getById).toBe('function');
        expect(typeof service.updateById).toBe('function');
        expect(typeof service.create).toBe('function');
    });

    it('should have a getAll function', function () {
        var value, flag;

        runs(function () {
            flag = false;
            service.getAll(function (data) {
                expect(typeof data).toBe('object');
                expect(Object.keys(data).length).toBe(0);

                service.getAll(function (data) {
                    value = data;
                    flag = true;
                });
            });
        });

        runs(function () {
            expect(typeof value).toBe('object');
            expect(Object.keys(value).length).toBe(0);
        });
    });

    it('should have a create function', function () {
        var value, flag;
        var person = {
            id: 1,
            name: 'test'
        };

        runs(function () {
            flag = false;
            service.create(person, function (data) {
                expect(typeof data).toBe('object');
                expect(data.person.id).toBe(1);
                expect(data.person.name).toBe('test');

                service.getAll(function (data) {
                    value = data;
                    flag = true;
                });
            });
        });

        runs(function () {
            expect(value.length).toBe(1);
        });
    });

    it('should have an update function', function () {
        var value, flag;
        var person = {
            id: 1,
            name: 'test'
        };

        runs(function () {
            flag = false;
            service.create(person, function (data) {
                expect(data.person.name).toBe('test');

                var updatedPerson = {
                    id: 1,
                    name: 'chuck'
                };

                service.updateById(0, updatedPerson, function (data) {
                    expect(data.person.name).toBe('chuck');

                    service.getAll(function (data) {
                        value = data;
                        flag = true;
                    });
                });
            });
        });

        runs(function () {
            expect(value.length).toBe(1);
            expect(value[0].name).toBe('chuck');
        });
    });

    it('should have a getById function', function () {
        var value, flag;
        var person = {
            id: 1,
            name: 'test'
        };

        runs(function () {
            flag = false;

            service.getById(0, function (data) {
                expect(data).toBeUndefined();

                service.create(person, function (data) {
                    expect(data.person.name).toBe('test');

                    service.getById(0, function (data) {
                        value = data;
                        flag = true;
                    });
                });
            });
        });

        runs(function () {
            expect(value.name).toBe('test');
            expect(value.id).toBe(1);
        });
    });
});