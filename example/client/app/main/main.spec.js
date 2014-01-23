
'use strict';

describe('App main', function () {

    beforeEach(module('main'));

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
});
