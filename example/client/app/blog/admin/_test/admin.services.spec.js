/*global describe, it, expect, beforeEach, inject, runs */
'use strict';

describe('admin services', function () {
    var service;

    beforeEach(function () {
        module('admin.services');
        module('mocks');
        inject(function ($injector) {
            service = $injector.get('auhtorPosts');
        });
    });

    it('should be defined', function () {
        expect(service).toBeDefined();
        expect(service.posts).toBeUndefined();
    });

    it('should have some functions', function () {
//        expect(typeof service.getAll).toBe('function');
        expect(typeof service.getById).toBe('function');
        expect(typeof service.update).toBe('function');
        expect(typeof service.create).toBe('function');
    });
//
//    it('should have a getAll function', function () {
//        var value, flag;
//
//        runs(function () {
//            flag = false;
//            service.getAll({}, function (data) {
//                expect(typeof data).toBe('object');
//                expect(Object.keys(data).length).toBe(0);
//
//                service.getAll({}, function (data) {
//                    value = data;
//                    flag = true;
//                });
//            });
//        });
//
//        runs(function () {
//            expect(typeof value).toBe('object');
//            expect(Object.keys(value).length).toBe(0);
//        });
//    });

    it('should have a create function', function () {
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

    it('should have an update function', function () {
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

    it('should have a getById function', function () {
        var value, flag;

        runs(function () {
            flag = false;

            service.getById(0, function (data) {
                expect(data).toBe(0);

                service.getById(99, function (data) {
                    value = data;
                    flag = true;
                });

            });
        });

        runs(function () {
            expect(value).toBe(99);
        });
    });
});