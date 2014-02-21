'use strict';

describe('Common: common.nav', function () {

    var $scope, $ctrl, $httpBackend;
    var navigationMock = [
        {
            title: 'TEST',
            route: '/test',
            app: 'unitTest'
        }
    ];

    describe('Controller: CommonNavCtrl', function () {

        beforeEach(module('common.nav'));
        beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {

            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            $httpBackend.expectPOST('/api/navigation/getList')
                .respond(navigationMock);
            $ctrl = $controller('CommonNavCtrl', {$scope: $scope});
        }));

        it('should active the correct location', function () {

            inject(function ($location) {
                $location.path('/test/path');
            });

            expect($scope.isActive('/test/path').isTrue);
            expect($scope.isActive('/test/').isFalse);
        });

        it('should attach menu to the scope', function () {
            expect($scope.menu).toBeUndefined();
            $httpBackend.flush();
            expect($scope.menu.length).toBeGreaterThan(0);
            expect($scope.menu[0].title).toBe('TEST');
            expect($scope.menu[0].route).toBe('/test');
            expect($scope.menu[0].app).toBe('unitTest');
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
                    .respond(navigationMock);

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

        it('getTree should be return cache navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTree')
                    .respond(navigationMock);

                $navigation = navigation;
            });

            // First run load from backend and create cache
            $navigation.getTree(function () {
                // Second run load from cache
                $navigation.getTree(function (error, result) {
                    $error = error;
                    $value = result;
                });
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getList')
                    .respond(navigationMock);

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

        it('getList should be return cache navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getList')
                    .respond(navigationMock);

                $navigation = navigation;
            });

            // First run load from backend and create cache
            $navigation.getList(function () {
                // Second run load from cache
                $navigation.getList(function (error, result) {
                    $error = error;
                    $value = result;
                });
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getTopList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(navigationMock);

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

        it('getTopList should be return cache navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getTopList')
                    .respond(navigationMock);

                $navigation = navigation;
            });

            // First run load from backend and create cache
            $navigation.getTopList(function () {
                // Second run load from cache
                $navigation.getTopList(function (error, result) {
                    $error = error;
                    $value = result;
                });
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getSubTree should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubTree')
                    .respond(navigationMock);

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

        it('getSubTree should be return cache navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubTree')
                    .respond(navigationMock);

                $navigation = navigation;
            });

            // First run load from backend and create cache
            $navigation.getSubTree({top: 'main'}, function () {
                // Second run load from cache
                $navigation.getSubTree({top: 'main'}, function (error, result) {
                    $error = error;
                    $value = result;
                });
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });

        it('getSubList should be return a navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(navigationMock);

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

        it('getSubList should be return cache navigation', function () {
            inject(function (_$httpBackend_, navigation) {
                $navigationProvider.setCurrentApp('test');

                $httpBackend = _$httpBackend_;
                $httpBackend.expectPOST('/api/navigation/getSubList')
                    .respond(navigationMock);

                $navigation = navigation;
            });

            // First run load from backend and create cache
            $navigation.getSubList({top: 'main'}, function () {
                // Second run load from cache
                $navigation.getSubList({top: 'main'}, function (error, result) {
                    $error = error;
                    $value = result;
                });
            });

            $httpBackend.flush();

            expect($navigation.getCurrentApp()).toBe('test');
            expect($value.length).toBeGreaterThan(0);
            expect($value[0].title).toBe('TEST');
            expect($value[0].route).toBe('/test');
            expect($value[0].app).toBe('unitTest');
            expect($error).toBe(null);
        });
    });
});
