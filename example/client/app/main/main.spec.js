'use strict';

describe('App main', function () {

    beforeEach(module('main'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(module('tmh.dynamicLocale'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes[null].redirectTo).toEqual('/');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
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

    describe('App main - $routeChangeStart event ', function () {

        var $window, $rootScope, $log, $bbcSession, $location;

        beforeEach(module('bbc.session'));

        beforeEach(function () {
            $window = {location: { assign: jasmine.createSpy()} };
            $location = {url: jasmine.createSpy()};

            module(function ($provide) {
                $provide.value('$window', $window);
//                $provide.value('$location', $location);
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
});
