'use strict';

describe('Common: common.nav', function () {

    describe('Controller: CommonNavCtrl', function () {

        beforeEach(module('bbc.transport'));
        beforeEach(module('common.nav'));

        var $navigation, $scope, $ctrl, location;

        var navigationMockTop = [
            {
                title: 'TEST',
                route: '/test',
                app: 'unitTest'
            }
        ];
        var navigationMockSub = [
            {
                title: 'TEST-SUB',
                route: '/test-sub',
                app: 'unitTest'
            }
        ];

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector, $location) {

                $navigation = $injector.get('$bbcNavigation');
                location = $location;
                $navigation.getRoute = function() {
                    return('/test');
                };
                $navigation.getTopList = function(callback) {
                    callback(null, navigationMockTop);
                };
                $navigation.getSubList = function(callback) {
                    callback(null, navigationMockSub);
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
                done();
            });
        });

        it('should active the correct location', function () {

            location.path('/test/path');
            expect($scope.isActive('/test')).toBe(true);
            expect($scope.isActive('/test/path')).toBe(true);
            expect($scope.isActive('/test/foo')).toBe(false);
        });

        it('should attach menus to the scope', function () {
            expect($scope.menuTopList.length).toBeGreaterThan(0);
            expect($scope.menuTopList[0].title).toBe('TEST');
            expect($scope.menuTopList[0].route).toBe('/test');
            expect($scope.menuTopList[0].app).toBe('unitTest');

            expect($scope.menuSubList.length).toBeGreaterThan(0);
            expect($scope.menuSubList[0].title).toBe('TEST-SUB');
            expect($scope.menuSubList[0].route).toBe('/test-sub');
            expect($scope.menuSubList[0].app).toBe('unitTest');
        });

        describe('test error in menuTopList', function() {

            beforeEach(function (done) {
                inject(function ($controller, $rootScope, $injector) {

                    $navigation = $injector.get('$bbcNavigation');
                    $navigation.getTopList = function(callback) {
                        callback('error');
                    };
                    $navigation.getSubList = function(callback) {
                        callback(null, navigationMockSub);
                    };

                    $scope = $rootScope.$new();
                    $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
                    done();
                });
            });

            it('should be attach a empty menuTopList and an correct menuSubList', function () {

                expect($scope.menuTopList.length).toBe(0);

                expect($scope.menuSubList.length).toBeGreaterThan(0);
                expect($scope.menuSubList[0].title).toBe('TEST-SUB');
                expect($scope.menuSubList[0].route).toBe('/test-sub');
                expect($scope.menuSubList[0].app).toBe('unitTest');
            });
        });

        describe('test error in menuSubList', function() {

            beforeEach(function (done) {
                inject(function ($controller, $rootScope, $injector) {

                    $navigation = $injector.get('$bbcNavigation');
                    $navigation.getTopList = function(callback) {
                        callback(null, navigationMockTop);
                    };
                    $navigation.getSubList = function(callback) {
                        callback('error');
                    };

                    $scope = $rootScope.$new();
                    $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
                    done();
                });
            });

            it('should be attach a empty menuSubList and an correct menuTopList', function () {

                expect($scope.menuSubList.length).toBe(0);

                expect($scope.menuTopList.length).toBeGreaterThan(0);
                expect($scope.menuTopList[0].title).toBe('TEST');
                expect($scope.menuTopList[0].route).toBe('/test');
                expect($scope.menuTopList[0].app).toBe('unitTest');
            });
        });
    });
});
