/*global describe, it, expect, beforeEach, inject, runs, waitsFor */
'use strict';

var ctrl, scope, flag, value, service, dataTmp, lxAlert;
dataTmp = [
    {name: 'p1', description: 'des1'},
    {name: 'p2', description: 'des2'},
    {name: 'p3', description: 'des3'}
];

describe('enterprise', function () {
    beforeEach(module('lx.alert'));
    beforeEach(module('ui.bootstrap.modal'));
    beforeEach(module('baboon.msgBox'));
    beforeEach(module('enterprise'));
    beforeEach(module('mocks'));

    // blogCtrl tests
    describe('enterpriseCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxSocket');
            lxAlert = $injector.get('lxAlert');
            service.emit = function (eventName, data, callback) {
                value = {
                    data: dataTmp,
                    count: 3
                };
                callback(value);
                flag = true;
            };

            scope = $rootScope.$new();
            scope.lxAlert = lxAlert;
            ctrl = $controller('enterpriseCtrl', {$scope: scope});
        }));

        it('should be initialized correctly', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                expect(typeof scope.lxAlert).toBe('object');
                expect(typeof scope.visible).toBe('object');
                expect(typeof scope.createTestMembers).toBe('function');
                expect(typeof scope.resetDb).toBe('function');
                expect(typeof scope.deleteMember).toBe('function');

                waitsFor(function () {
                    return scope.crew.length > 0;
                }, 'Length should be greater than 0', 1000);

                runs(function () {
                    expect(typeof scope.crew).toBe('object');
                    expect(scope.crew).toEqual(dataTmp);
                });
            });
        });
        it('should be create test-members', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                scope.crew = []; // reset crew
                scope.createTestMembers();

                waitsFor(function () {
                    return scope.crew.length > 0;
                }, 'Length should be greater than 0', 1000);
            });

            runs(function () {
                expect(scope.crew).toEqual(dataTmp);
                expect(scope.lxAlert.type).toEqual('success');
                expect(scope.lxAlert.msg).toEqual('crew created.');
            });
        });
        it('should be not create test-members by crew.length > 0', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                scope.createTestMembers();

                waitsFor(function () {
                    return scope.crew.length > 0;
                }, 'Length should be greater than 0', 1000);
            });

            runs(function () {
                expect(scope.crew).toEqual(dataTmp);
                expect(scope.lxAlert.type).toEqual('error');
                expect(scope.lxAlert.msg).toEqual('can\'t create test crew, already exists.');
            });
        });
        it('should be not create test-members by service error.', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {

                service.emit = function (eventName, data, callback) {
                    if (eventName === 'example/enterprise/enterprise/createTestMembers') {
                        callback({message: 'Could not create test crew!'});
                    }
                    else {
                        value = {
                            data: dataTmp,
                            count: 3
                        };
                        callback(value);
                    }

                    flag = true;
                };

                scope.crew = []; // reset crew
                scope.createTestMembers();

                waitsFor(function () {
                    return scope.crew.length > 0;
                }, 'Length should be greater than 0', 1000);
            });

            runs(function () {
                expect(scope.crew).toEqual(dataTmp);
                expect(scope.lxAlert.type).toEqual('error');
                expect(scope.lxAlert.msg).toEqual('Could not create test crew!');
            });
        });
    });
});
