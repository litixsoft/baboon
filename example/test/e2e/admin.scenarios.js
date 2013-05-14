'use strict';

/*global describe, it, expect, browser, element, input, sleep*/
describe('Admin Scenarios', function () {
    it('should redirect index.html', function () {
        browser().navigateTo('/admin');
        expect(browser().location().url()).toEqual('/admin');
    });

    it('should redirect to post.html', function () {
        browser().navigateTo('/admin');
        element('a[name=newPost]').click();

        expect(browser().location().url()).toEqual('/admin/post/new');
    });

    it('should save', function () {
        browser().navigateTo('/admin/post/new');

        input('post.title').enter('e2e');
        input('post.content').enter('e2e Content');
        element('button[name=save]').click();

        sleep(1);

        expect(input('post.created').val()).toContain('2013-05-');
    });

    it('should reset the form', function () {
        browser().navigateTo('/admin/post/new');

        input('post.title').enter('e2e');
        input('post.content').enter('e2e Content');
        element('button[name=reset]').click();

        expect(input('post.title').val()).toEqual('');
        expect(input('post.content').val()).toEqual('');
        expect(element('button[name=reset]').attr('disabled')).toEqual('disabled');

    });
});