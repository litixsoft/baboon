'use strict';

describe('Module: admin', function () {

    beforeEach(module('admin'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes[null].redirectTo).toEqual('/admin/home');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });
});
