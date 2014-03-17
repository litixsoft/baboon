'use strict';

describe('Common: common.nav', function () {
    var navigationMockTop = [
        { title: 'TEST', route: '/test', app: 'unitTest' }
    ];
    var navigationMockSub = [
        { title: 'TEST-SUB', route: '/test-sub', app: 'unitTest' }
    ];

    describe('navigationTop', function(){
        beforeEach(module('bbc.transport'));
        beforeEach(module('common.navigation'));
        beforeEach(module('pascalprecht.translate'));

        var $navigation, $scope, location, element, compile;

        beforeEach(function (done) {
            inject(function ($compile, $rootScope, $injector, $location) {
                compile = $compile;
                $navigation = $injector.get('$bbcNavigation');
                location = $location;
                $navigation.getRoute = function() {
                    return('/test');
                };
                $navigation.getTopList = function(callback) {
                    callback(null, navigationMockTop);
                };

                $scope = $rootScope.$new();
                element = angular.element('<navigation-top></navigation-top>');
                compile(element)($scope);
                done();
            });
        });

        it('should be correct initialized', function () {
            var elementScope = element.isolateScope();

            expect(elementScope.menuTopList).toBeDefined();
            expect(elementScope.menuTopList.length).toBe(1);
        });

        it('should attach menus to the scope', function () {
            var elementScope = element.isolateScope();

            expect(elementScope.menuTopList.length).toBeGreaterThan(0);
            expect(elementScope.menuTopList[0].title).toBe('TEST');
            expect(elementScope.menuTopList[0].route).toBe('/test');
            expect(elementScope.menuTopList[0].app).toBe('unitTest');
        });

        it('should active the correct location', function () {
            var elementScope = element.isolateScope();

            location.path('/test/path');
            expect(elementScope.isActive('/test')).toBe(true);
            expect(elementScope.isActive('/test/path')).toBe(true);
            expect(elementScope.isActive('/test/foo')).toBe(false);
        });

        it('should not have a class nav-stacked', function() {
            expect(element.hasClass('nav-stacked')).toBe(false);
        });

        it('should add a class by orientation', function() {
            element = angular.element('<navigation-top orientation="vertical"></navigation-top>');
            compile(element)($scope);
            expect(element.hasClass('nav-stacked')).toBe(true);
        });
    });

    describe('navigationTop with error', function() {
        beforeEach(module('bbc.transport'));
        beforeEach(module('common.navigation'));
        beforeEach(module('pascalprecht.translate'));

        var $navigation, $scope, element;

        beforeEach(function (done) {
            inject(function ($compile, $rootScope, $injector) {
                $navigation = $injector.get('$bbcNavigation');
                $navigation.getTopList = function(callback) {
                    callback('error');
                };

                $scope = $rootScope.$new();
                element = angular.element('<navigation-top></navigation-top>');
                $compile(element)($scope);
                done();
            });
        });

        it('should be attach a empty menuTopList', function () {
            var elementScope = element.isolateScope();

            expect(elementScope.menuTopList.length).toBe(0);
        });
    });

    describe('navigationSub', function(){
        beforeEach(module('bbc.transport'));
        beforeEach(module('common.navigation'));
        beforeEach(module('pascalprecht.translate'));

        var $navigation, $scope, location, element, compile;

        beforeEach(function (done) {
            inject(function ($compile, $rootScope, $injector, $location) {
                compile = $compile;
                $navigation = $injector.get('$bbcNavigation');
                location = $location;
                $navigation.getRoute = function() {
                    return('/test-sub');
                };
                $navigation.getSubList = function(callback) {
                    callback(null, navigationMockSub);
                };

                $scope = $rootScope.$new();
                element = angular.element('<navigation-sub></navigation-sub>');
                compile(element)($scope);
                done();
            });
        });

        it('should be correct initialized', function () {
            var elementScope = element.isolateScope();

            expect(elementScope.menuSubList).toBeDefined();
            expect(elementScope.menuSubList.length).toBe(1);
        });

        it('should attach menus to the scope', function () {
            var elementScope = element.isolateScope();

            expect(elementScope.menuSubList.length).toBeGreaterThan(0);
            expect(elementScope.menuSubList[0].title).toBe('TEST-SUB');
            expect(elementScope.menuSubList[0].route).toBe('/test-sub');
            expect(elementScope.menuSubList[0].app).toBe('unitTest');
        });

        it('should active the correct location', function () {
            var elementScope = element.isolateScope();

            location.path('/test-sub/path');
            expect(elementScope.isActive('/test-sub')).toBe(true);
            expect(elementScope.isActive('/test-sub/path')).toBe(true);
            expect(elementScope.isActive('/test-sub/foo')).toBe(false);
        });

        it('should have a class nav-stacked', function() {
            expect(element.hasClass('nav-stacked')).toBe(true);
        });

        it('should remove a class by orientation', function() {
            element = angular.element('<navigation-sub orientation="horizontal"></navigation-sub>');
            compile(element)($scope);
            expect(element.hasClass('nav-stacked')).toBe(false);
        });
    });

    describe('navigationSub with error', function() {
        beforeEach(module('bbc.transport'));
        beforeEach(module('common.navigation'));
        beforeEach(module('pascalprecht.translate'));

        var $navigation, $scope, element;

        beforeEach(function (done) {
            inject(function ($compile, $rootScope, $injector) {
                $navigation = $injector.get('$bbcNavigation');
                $navigation.getSubList = function(callback) {
                    callback('error');
                };

                $scope = $rootScope.$new();
                element = angular.element('<navigation-sub></navigation-sub>');
                $compile(element)($scope);
                done();
            });
        });

        it('should be attach a empty menuSubList', function () {
            var elementScope = element.isolateScope();
            expect(elementScope.menuSubList.length).toBe(0);
        });
    });
});
