/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('blog services', function () {
    var service;

    beforeEach(function () {
        module('blog.services');
        module('mocks');
    });

    describe('posts', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('posts');
            });
        });

        it('should be initialized correctly', function () {
            expect(service).toBeDefined();
            expect(service.posts).toBeUndefined();
            expect(typeof service.getAll).toBe('function');
            expect(typeof service.getById).toBe('function');
            expect(typeof service.getAllWithCount).toBe('function');
            expect(typeof service.searchPosts).toBe('function');
            expect(typeof service.addComment).toBe('function');
        });

        it('should return all blog posts', function () {
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

        it('should return all blog posts with count', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.getAllWithCount({}, function (data) {
                    expect(typeof data).toBe('object');
                    expect(Object.keys(data).length).toBe(0);

                    service.getAllWithCount({}, function (data) {
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

        it('should return a single blog post', function () {
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

        it('should find a blog post by title or content', function () {
            var value, flag;

            runs(function () {
                flag = false;
                service.searchPosts({params: 'test'}, function (data) {
                    expect(typeof data).toBe('object');
                    expect(data.params).toBe('test');

                    service.searchPosts({}, function (data) {
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
});
