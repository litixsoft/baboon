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
});
