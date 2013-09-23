/*global describe, it, expect, beforeEach, inject, module */
'use strict';

describe('baboon message box', function () {
    var service;

    beforeEach(function () {
        module('ui.bootstrap.modal');
        module('lx.modal');
    });

    describe('lxModal', function () {
        beforeEach(function () {
            inject(function ($injector) {
                service = $injector.get('lxModal');
            });
        });

        it('should be initialized correctly', function () {
            expect(service).toBeDefined();
            expect(service.opts).toBeDefined();
            expect(service.close).toBeDefined();
            expect(service.show).toBeDefined();
            expect(service.ok).toBeDefined();
        });

        it('should open the dialog and set the message and headline', function () {
            service.msgBox('header', 'wayne');

            expect(service.headline).toBe('header');
            expect(service.message).toBe('wayne');
            expect(service.type).toBe('Error');
            expect(service.action).toBeUndefined();
        });

        it('should open the dialog and set the type', function () {
            service.msgBox('', '', 'Warning');

            expect(service.headline).toBe('');
            expect(service.message).toBe('');
            expect(service.type).toBe('Warning');
            expect(service.action).toBeUndefined();
        });

        it('should open the dialog and set the callback', function () {
            service.msgBox('header', 'wayne', 'Info', function () {});

            expect(service.headline).toBe('header');
            expect(service.message).toBe('wayne');
            expect(service.type).toBe('Info');
            expect(service.action).toBeDefined();
            expect(typeof service.action).toBe('function');
        });

        it('should close the dialog', function () {
            service.close();

            expect(service.message).toBe('');
            expect(service.type).toBe('');
            expect(service.action).toBeNull();
        });

        it('should close the dialog and do nothing when no action is defined', function () {
            service.msgBox('header', 'wayne');
            service.ok();

            expect(service.headline).toBe('');
            expect(service.message).toBe('');
            expect(service.type).toBe('');
            expect(service.action).toBeNull();
        });

        it('should close the dialog and execute the action if an action is defined', function () {
            var test = 1,
                testFn = function () {
                    test++;
                };

            service.msgBox('', 'wayne', 'Info', testFn);

            expect(service.action).toBeDefined();
            expect(typeof service.action).toBe('function');

            service.ok();

            expect(service.message).toBe('');
            expect(service.type).toBe('');
            expect(service.action).toBeNull();
            expect(test).toBe(2);
        });
    });
});