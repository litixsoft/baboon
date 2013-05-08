'use strict';

/*global describe, it, expect, browser*/
describe('Blog Scenarios', function () {

    it('should redirect index.html', function () {
        browser().navigateTo('/blog');
        expect(browser().location().url()).toEqual('/blog');
    });
});