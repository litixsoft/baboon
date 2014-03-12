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

                $navigation = $injector.get('navigation');
                location = $location;
                $navigation.getTopList = function(callback) {
                    callback(null, navigationMockTop);
                };
                $navigation.getSubList = function(path, callback) {
                    path = null;
                    callback(null, navigationMockSub);
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
                done();
            });
        });

        it('should active the correct location', function () {

            location.path('/test/path');

            expect($scope.isActive('/test/path').isTrue);
            expect($scope.isActive('/test/').isFalse);
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

                    $navigation = $injector.get('navigation');
                    $navigation.getTopList = function(callback) {
                        callback('error');
                    };
                    $navigation.getSubList = function(path, callback) {
                        path = null;
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

                    $navigation = $injector.get('navigation');
                    $navigation.getTopList = function(callback) {
                        callback(null, navigationMockTop);
                    };
                    $navigation.getSubList = function(path, callback) {
                        path = null;
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
