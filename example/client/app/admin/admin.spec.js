'use strict';

describe('App: admin', function () {

    beforeEach(module('admin'));
    beforeEach(module('bbc.transport'));

    it('should map routes', function () {

        inject(function ($route) {

            expect($route.routes['/admin'].controller).toBe('AdminCtrl');
            expect($route.routes['/admin'].templateUrl).toEqual('app/admin/admin.html');

            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/admin');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

    it('should call $translate switch the locale', function () {
        inject(function ($rootScope) {

            $rootScope.switchLocale('de-de');
            expect($rootScope.currentLang).toBe('de-de');
        });
    });

    it('should raise the $translateChangeSuccess event', function () {

        var setTmp;

        inject(function ($rootScope, $translate, tmhDynamicLocale) {

            $translate.use = function () {
                return 'test';
            };
            tmhDynamicLocale.set = function (translate) {
                setTmp = translate;
            };

            $rootScope.$emit('$translateChangeSuccess');
            expect(setTmp).toBe('test');
        });
    });

    it('should raise the $sessionInactive event', function () {

        inject(function ($rootScope, $log) {

            spyOn($log, 'warn');

            expect($rootScope.requestNeeded).toBe(false);
            $rootScope.$emit('$sessionInactive');
            expect($rootScope.requestNeeded).toBe(true);
            expect($log.warn).toHaveBeenCalledWith('next route change event triggers a server request.');
        });
    });

    describe('App admin - $routeChangeStart event ', function () {

        var $window, $rootScope, $log, $bbcSession, $location;

        beforeEach(module('bbc.session'));

        beforeEach(function () {
            $window = {location: { assign: jasmine.createSpy()} };
            $location = {url: jasmine.createSpy()};

            module(function ($provide) {
                $provide.value('$window', $window);
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $rootScope.requestNeeded = true;
                $log = $injector.get('$log');
                $bbcSession = $injector.get('$bbcSession');
                $bbcSession.setActivity = function (callback) {
                    callback(null);
                };
                $location = $injector.get('$location');
            });
        });

        it('should raise the $routeChangeStart event', function () {
            $rootScope.$emit('$routeChangeStart', {$$route:{originalPath:'/test'}});
            expect($window.location.assign).toHaveBeenCalledWith('/test');
        });

        it('should raise the $routeChangeStart event with $rootScope.requestNeeded is false', function () {
            $rootScope.requestNeeded = false;
            $rootScope.$emit('$routeChangeStart', {$$route:{originalPath:'/test'}});
        });

        it('should be error when session activity check returned error', function () {

            spyOn($log, 'warn');

            $bbcSession.setActivity = function (callback) {
                callback('test error');
            };

            $rootScope.$emit('$routeChangeStart', {$$route:{originalPath:'/test'}});
            expect($log.warn).toHaveBeenCalledWith('test error');
        });
    });

    describe('Controller: AdminCtrl', function () {

        var $transport, $scope, $ctrl;

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $transport = $injector.get('$bbcTransport');
                $transport.emit = function (event, callback) {
                    event = null;
                    callback(null, 'test');
                    done();
                };

                $scope = $rootScope.$new();
                $ctrl = $controller('AdminCtrl', {$scope: $scope});
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.awesomeThings).toBe('test');
        });

        describe('test error in awesomeThings', function(){

            var error;

            beforeEach(function (done) {
                inject(function ($controller, $rootScope, $injector, $log) {

                    $log.error = function(msg){
                        error = msg;
                    };
                    $transport = $injector.get('$bbcTransport');
                    $transport.emit = function (event, callback) {
                        event = null;
                        callback('awesomeThings error');
                        done();
                    };

                    $scope = $rootScope.$new();
                    $ctrl = $controller('AdminCtrl', {$scope: $scope});
                });
            });

            it('should attach empty vars to the scope and log error', function () {
                expect($scope.awesomeThings.length).toBe(0);
                expect(error).toBe('awesomeThings error');
            });
        });
    });
});
