'use strict';

/*global describe, it, expect, browser*/
describe('Application Scenarios', function () {

    it('should redirect index.html', function () {
        browser().navigateTo('/');

        expect(browser().location().url()).toEqual('/');
    });

    it('should redirect index.html when some unknown url is entered', function () {
        browser().navigateTo('/wayne');

        expect(browser().location().url()).toEqual('/');
    });
});