/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('enterprise services', function () {
    var service;

    beforeEach(function () {
        module('enterprise');
        module('enterprise.services');
        module('mocks');
    });

    describe('enterpriseCrew', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('enterpriseCrew');
            });
        });

        it('should be initialized correctly', function () {
            expect(service).toBeDefined();
            expect(service.enterpriseCrew).toBeUndefined();
            expect(typeof service.getAll).toBe('function');
            expect(typeof service.getById).toBe('function');
            expect(typeof service.update).toBe('function');
            expect(typeof service.create).toBe('function');
            expect(typeof service.createTestMembers).toBe('function');
            expect(typeof service.delete).toBe('function');
            expect(typeof service.deleteAllMembers).toBe('function');
        });

        it('should return all members', function () {
            //
            var value, flag;

            runs(function () {
                flag = false;
                service.getAll({}, function (data) {
                    expect(typeof data).toBe('object');
                    expect(Object.keys(data).length).toBe(0);

                    service.getAll({}, function (data) {
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

        it('should return a single member', function () {
            var value, flag;

            runs(function () {
                flag = false;

                service.getById(0, function (data) {
                    expect(data.id).toBe(0);

                    service.getById(99, function (data) {
                        value = data;
                        flag = true;
                    });
                });
            });

            runs(function () {
                expect(value.id).toBe(99);
            });
        });
        it('should update member', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.update({id:1}, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(typeof value).toBe('object');
                expect(value.id).toBe(1);
            });
        });
        it('should create a new member', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.create({name: 'm1', description: 'des1'}, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(typeof value).toBe('object');
                expect(value.name).toBe('m1');
                expect(value.description).toBe('des1');
            });
        });
        it('should delete a crew member', function () {
            var value, flag;

            runs(function () {
                flag = false;

                service.delete(0, function (data) {
                    expect(data.id).toBe(0);

                    service.delete(99, function (data) {
                        value = data;
                        flag = true;
                    });
                });
            });

            runs(function () {
                expect(value.id).toBe(99);
            });
        });
    });
});
