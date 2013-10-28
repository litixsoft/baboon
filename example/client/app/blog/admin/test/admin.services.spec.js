/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('admin services', function () {
    var service;

    beforeEach(function () {
        module('blog');
        module('lx.transport');
        module('admin.services');
        module('mocks');
    });

    describe('appBlogAdminTags', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('appBlogAdminTags');
            });
        });

        it('should be initialized correctly', function () {
            expect(service).toBeDefined();
            expect(typeof service.getAll).toBe('function');
            expect(typeof service.createTag).toBe('function');
            expect(typeof service.updateTag).toBe('function');
            expect(typeof service.deleteTag).toBe('function');
        });

        it('should return all tags', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.getAll({}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});

                    service.getAll(123, function (err, res) {
                        expect(err).toBeNull();
                        value = res;
                        flag = true;
                    });
                });
            });

            runs(function () {
                expect(value).toEqual({});
            });
        });

        it('should create a tag', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.createTag({name: 'angular'}, function (err, res) {
                    expect(err).toBeNull();
                    value = res;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.name).toBe('angular');
            });
        });

        it('should update a tag', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.updateTag({name: 'angular'}, function (err, res) {
                    expect(err).toBeNull();
                    value = res;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.name).toBe('angular');
            });
        });

        it('should delete a tag', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.deleteTag(123, function (err, res) {
                    expect(err).toBeNull();
                    value = res;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.id).toBe(123);
            });
        });
    });
});
