'use strict';

/*global describe, it, expect, browser, element, input, sleep*/
describe('Blog Scenarios', function () {
    it('should redirect index.html', function () {
        browser().navigateTo('/blog');
        expect(browser().location().url()).toEqual('/blog');
    });

    it('should redirect to post.html', function () {
        browser().navigateTo('/blog');
        element('.xxx').click();

        expect(browser().location().url()).toEqual('/blog/post/new');
    });

    it('should save', function () {
        browser().navigateTo('/blog/post/new');

        input('post.title').enter('e2e');
        input('post.content').enter('e2e Content');
        element('button[name=save]').click();

        sleep(1);

        expect(input('post.created').val()).toContain('2013-05-13');
    });

    it('should reset the form', function () {
        browser().navigateTo('/blog/post/new');

        input('post.title').enter('e2e');
        input('post.content').enter('e2e Content');
        element('button[name=reset]').click();

        expect(input('post.title').val()).toEqual('');
        expect(input('post.content').val()).toEqual('');
        expect(element('button[name=reset]').attr('disabled')).toEqual('disabled');

    });
});