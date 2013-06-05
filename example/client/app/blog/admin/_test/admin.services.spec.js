/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('admin services', function () {
    var service;

    beforeEach(function () {
        module('admin.services');
        module('mocks');
    });

    describe('authorPosts', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('authorPosts');
            });
        });

        it('should be initialized correctly', function () {
            expect(service).toBeDefined();
            expect(typeof service.getById).toBe('function');
            expect(typeof service.update).toBe('function');
            expect(typeof service.create).toBe('function');
            expect(typeof service.addComment).toBe('function');
        });

        it('should return a single blog post', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.getById(123, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(typeof value).toBe('object');
                expect(value.id).toBe(123);
            });
        });

        it('should create a blog post', function () {
            var value, flag;
            var post = {
                title: 'p1',
                content: 'test'
            };

            runs(function () {
                flag = false;
                service.create(post, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.title).toBe('p1');
                expect(value.content).toBe('test');
            });
        });

        it('should update a blog post', function () {
            var value, flag;
            var post = {
                title: 'p1',
                content: 'test'
            };

            runs(function () {
                flag = false;
                service.update(post, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.title).toBe('p1');
                expect(value.content).toBe('test');
            });
        });

        it('should add a comment to a blog post', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.addComment('123', {content: 'text'}, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(typeof value).toBe('object');
                expect(value.content).toBe('text');
                expect(value.post_id).toBe('123');
            });
        });
    });

    describe('tags', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('tags');
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
                service.getAll({}, function (data) {
                    expect(typeof data).toBe('object');
                    expect(Object.keys(data).length).toBe(0);

                    service.getAll({data: 123}, function (data) {
                        expect(typeof data).toBe('object');
                        expect(data.data).toBe(123);

                        service.getAll({}, function (data) {
                            value = data;
                            flag = true;
                        });
                    });
                });
            });

            runs(function () {
                expect(typeof value).toBe('object');
                expect(value.data).toBe(123);
            });
        });

        it('should create a tag', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.createTag({name: 'angular'}, function (data) {
                    value = data;
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
                service.updateTag({name: 'angular'}, function (data) {
                    value = data;
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
                service.deleteTag(123, function (data) {
                    value = data;
                    flag = true;
                });
            });

            runs(function () {
                expect(value.id).toBe(123);
            });
        });
    });
});
