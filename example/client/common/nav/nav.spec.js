'use strict';

describe('Common: common.nav', function () {

    var $scope, $ctrl, $httpBackend;
    var navigationMockTop = [
        {
            title: 'TEST',
            route: '/test',
            app: 'unitTest'
        }
    ];
    var navigationErrorMockTop = {
        name: 'navigationErrorMockTop',
        resource: 'test',
        statusCode: 400,
        message: 'Error message'
    };
    var navigationMockSub = [
        {
            title: 'TEST-SUB',
            route: '/test-sub',
            app: 'unitTest'
        }
    ];
    var navigationErrorMockSub = {
        name: 'navigationErrorMockSub',
        resource: 'test',
        statusCode: 400,
        message: 'Error message'
    };

    describe('Controller: CommonNavCtrl', function () {

        beforeEach(module('common.nav'));
        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {

            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            $httpBackend.expectPOST('/api/navigation/getTopList')
                .respond(navigationMockTop);
            $httpBackend.expectPOST('/api/navigation/getSubList')
                .respond(navigationMockSub);
            $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
        }));

        it('should active the correct location', function () {

            inject(function ($location) {
                $location.path('/test/path');
            });

            expect($scope.isActive('/test/path').isTrue);
            expect($scope.isActive('/test/').isFalse);
        });

        it('should attach menus to the scope', function () {
            expect($scope.menuTopList).toBeUndefined();
            expect($scope.menuSubList).toBeUndefined();
            $httpBackend.flush();

            expect($scope.menuTopList.length).toBeGreaterThan(0);
            expect($scope.menuTopList[0].title).toBe('TEST');
            expect($scope.menuTopList[0].route).toBe('/test');
            expect($scope.menuTopList[0].app).toBe('unitTest');

            expect($scope.menuSubList.length).toBeGreaterThan(0);
            expect($scope.menuSubList[0].title).toBe('TEST-SUB');
            expect($scope.menuSubList[0].route).toBe('/test-sub');
            expect($scope.menuSubList[0].app).toBe('unitTest');
        });

        it('should be attach a empty menuTopList and an correct menuSubList', function () {

            inject(function (_$httpBackend_, $controller, $rootScope) {
                $scope = $rootScope.$new();
                $httpBackend = _$httpBackend_;

                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(500, navigationErrorMockTop);

                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(navigationMockSub);

                $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
            });

            expect($scope.menuTopList).toBeUndefined();
            expect($scope.menuSubList).toBeUndefined();

            $httpBackend.flush();

            expect($scope.menuTopList.length).toBe(0);

            expect($scope.menuSubList.length).toBeGreaterThan(0);
            expect($scope.menuSubList[0].title).toBe('TEST-SUB');
            expect($scope.menuSubList[0].route).toBe('/test-sub');
            expect($scope.menuSubList[0].app).toBe('unitTest');
        });

        it('should be attach a empty menuSubList and an correct menuTopList', function () {

            inject(function (_$httpBackend_, $controller, $rootScope) {
                $scope = $rootScope.$new();
                $httpBackend = _$httpBackend_;

                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(navigationMockTop);

                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(500, navigationErrorMockSub);

                $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
            });



            expect($scope.menuTopList).toBeUndefined();
            expect($scope.menuSubList).toBeUndefined();

            $httpBackend.flush();

            expect($scope.menuSubList.length).toBe(0);

            expect($scope.menuTopList.length).toBeGreaterThan(0);
            expect($scope.menuTopList[0].title).toBe('TEST');
            expect($scope.menuTopList[0].route).toBe('/test');
            expect($scope.menuTopList[0].app).toBe('unitTest');
        });

    });

    describe('Provider: navigation', function () {
        var $navigationProvider, $navigation, $value, $error;

        beforeEach(module('common.nav'));
        beforeEach(module(function (navigationProvider) {
            $navigationProvider = navigationProvider;
        }));

        it('should be set the correct current app', function () {
            inject(function (navigation) {
                $navigationProvider.setCurrentApp('test');
                $navigation = navigation;
            });

            expect($navigation.getCurrentApp()).toBe('test');
        });

        it('getTree should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTree')
                    .respond(navigationMockTop);

                $navigation = navigation;
            });

            $navigation.getTree(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getTree should be return an error', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTree')
                    .respond(400, 'Error:unitTest');

                $navigation = navigation;
            });

            $navigation.getTree(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value).toBeUndefined();
            expect($error).toBeDefined();
            expect($error.data).toBe('Error:unitTest');
            expect($error.status).toBe(400);
        });

        it('getList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getList')
                    .respond(navigationMockTop);

                $navigation = navigation;
            });

            $navigation.getList(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getList should be return an error', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getList')
                    .respond(400, 'Error:unitTest');

                $navigation = navigation;
            });

            $navigation.getList(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value).toBeUndefined();
            expect($error).toBeDefined();
            expect($error.data).toBe('Error:unitTest');
            expect($error.status).toBe(400);
        });

        it('getTopList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(navigationMockTop);

                $navigation = navigation;
            });

            $navigation.getTopList(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getTopList should be return an error', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(400, 'Error:unitTest');

                $navigation = navigation;
            });

            $navigation.getTopList(function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value).toBeUndefined();
            expect($error).toBeDefined();
            expect($error.data).toBe('Error:unitTest');
            expect($error.status).toBe(400);
        });

        it('getSubTree should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubTree')
                    .respond(navigationMockTop);

                $navigation = navigation;
            });

            $navigation.getSubTree({top: 'main'}, function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getSubTree should be return an error', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubTree')
                    .respond(400, 'Error:unitTest');

                $navigation = navigation;
            });

            $navigation.getSubTree({top: 'main'}, function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value).toBeUndefined();
            expect($error).toBeDefined();
            expect($error.data).toBe('Error:unitTest');
            expect($error.status).toBe(400);
        });

        it('getSubList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(navigationMockTop);

                $navigation = navigation;
            });

            $navigation.getSubList({top: 'main'}, function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getSubList should be return an error', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(400, 'Error:unitTest');

                $navigation = navigation;
            });

            $navigation.getSubList({top: 'main'}, function (error, result) {
                $error = error;
                $value = result;
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value).toBeUndefined();
            expect($error).toBeDefined();
            expect($error.data).toBe('Error:unitTest');
            expect($error.status).toBe(400);
        });
    });
});
