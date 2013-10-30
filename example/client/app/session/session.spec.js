/*global describe, it, expect, beforeEach, inject, runs */
'use strict';
var ctrl, scope, service, data, tmp;

describe('session modul', function () {
    beforeEach(module('ngRoute'));
    beforeEach(module('session'));
    beforeEach(module('mocks'));

    // newCtrl tests
    describe('sessionCtrl correctly tests', function () {

        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxSession');
            service.getLastActivity = function(callback) {
                tmp = new Date();
                data = {activity: tmp.toISOString()};
                callback(null, data);
            };

            scope = $rootScope.$new();
            ctrl = $controller('sessionCtrl', {$scope: scope});


        }));

        it('should be initialized correctly', function () {
            expect(typeof scope.getLastActivity).toBe('function');
            expect(typeof scope.setActivity).toBe('function');
            expect(typeof scope.getData).toBe('function');
            expect(typeof scope.deleteData).toBe('function');
            expect(typeof scope.setData).toBe('function');
            expect(typeof scope.clearLog).toBe('function');
        });

        it('should be time from getLastActivity correctly', function () {
            runs(function () {
                scope.getLastActivity();
            });

            runs(function () {
                expect(scope.logs_1[0]).toBe('last activity is ' + tmp);
            });
        });
    });
    describe('sessionCtrl error tests', function () {

        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxSession');
            service.getLastActivity = function(callback) {
                data = {message: 'activity not found in session'};
                callback({status: 500, data: data});
            };

            scope = $rootScope.$new();
            ctrl = $controller('sessionCtrl', {$scope: scope});


        }));

        it('should be error message from getLastActivity correctly', function () {
            runs(function () {
                scope.getLastActivity();
            });

            runs(function () {
                expect(scope.logs_1[0]).toEqual({status: 500, data: data});
            });
        });
    });
});