'use strict';

/*global describe, it, expect, browser*/
describe('Enterprise app', function () {

    it('should redirect index.html', function () {
        browser().navigateTo('/blog');
        expect(browser().location().url()).toEqual('/blog');
    });
});