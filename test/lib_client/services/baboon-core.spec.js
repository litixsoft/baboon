/*global describe, it, expect, beforeEach, inject, module */
'use strict';

describe('baboon core services', function () {
    var service;

    beforeEach(function () {
        module('baboon.core');
    });

    describe('msgBox', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('msgBox');
            });
        });

        it('should be initialized correctly', function () {
            expect(service.modal).toBeDefined();
            expect(service.modal.opts).toBeDefined();
            expect(service.modal.close).toBeDefined();
            expect(service.modal.show).toBeDefined();
            expect(service.modal.ok).toBeDefined();
        });

        it('should open the dialog and set the message and headline', function () {
            service.modal.show('header', 'wayne');

            expect(service.modal.shouldBeOpen).toBeTruthy();
            expect(service.modal.headline).toBe('header');
            expect(service.modal.message).toBe('wayne');
            expect(service.modal.type).toBe('Error');
            expect(service.modal.action).toBeUndefined();
        });

        it('should open the dialog and set the type', function () {
            service.modal.show('', '', 'Warning');

            expect(service.modal.shouldBeOpen).toBeTruthy();
            expect(service.modal.headline).toBe('');
            expect(service.modal.message).toBe('');
            expect(service.modal.type).toBe('Warning');
            expect(service.modal.action).toBeUndefined();
        });

        it('should open the dialog and set the callback', function () {
            service.modal.show('header', 'wayne', 'Info', function () {});

            expect(service.modal.shouldBeOpen).toBeTruthy();
            expect(service.modal.headline).toBe('header');
            expect(service.modal.message).toBe('wayne');
            expect(service.modal.type).toBe('Info');
            expect(service.modal.action).toBeDefined();
            expect(typeof service.modal.action).toBe('function');
        });

        it('should close the dialog', function () {
            service.modal.close();

            expect(service.modal.shouldBeOpen).toBeFalsy();
            expect(service.modal.message).toBe('');
            expect(service.modal.type).toBe('');
            expect(service.modal.action).toBeNull();
        });

        it('should close the dialog and do nothing when no action is defined', function () {
            service.modal.show('header', 'wayne');
            service.modal.ok();

            expect(service.modal.shouldBeOpen).toBeFalsy();
            expect(service.modal.headline).toBe('');
            expect(service.modal.message).toBe('');
            expect(service.modal.type).toBe('');
            expect(service.modal.action).toBeNull();
        });

        it('should close the dialog and execute the action if an action is defined', function () {
            var test = 1,
                testFn = function () {
                    test++;
                };

            service.modal.show('', 'wayne', 'Info', testFn);

            expect(service.modal.action).toBeDefined();
            expect(typeof service.modal.action).toBe('function');

            service.modal.ok();

            expect(service.modal.shouldBeOpen).toBeFalsy();
            expect(service.modal.message).toBe('');
            expect(service.modal.type).toBe('');
            expect(service.modal.action).toBeNull();
            expect(test).toBe(2);
        });
    });

    describe('cache', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('cache');
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
                var serviceRef = $injector.get('cache');

                expect(serviceRef.test).toBe(1);
                expect(serviceRef.obj).toEqual({name: 'wayne', age: 10});
            });
        });
    });
});