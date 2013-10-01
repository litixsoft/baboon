/*global describe, it, expect, browser, input, sleep, element, repeater */
'use strict';

describe('Admin Scenarios', function () {
    it('should show the blog posts', function () {
        browser().navigateTo('/blog/admin');
        sleep(1);

        expect(browser().location().url()).toEqual('/blog/admin');
        expect(repeater('table[name=posts] tbody tr').count()).toBe(0);
    });

    it('should redirect to post.html', function () {
        browser().navigateTo('/blog/admin');
        element('a[name=newPost]').click();

        expect(browser().location().url()).toEqual('/blog/admin/post/new');
    });

    it('should save a new blog post', function () {
//        browser().navigateTo('/login');
//        sleep(1);
//
////        input('username').enter('admin');
////        input('password').enter('a');
//
//        element('input[name=username]').text('admin');
//        element('input[name=password]').text('admin');
//
//        element('input[name=login]').click();
//        sleep(1);

        browser().navigateTo('/blog/admin');
        sleep(1);
        expect(repeater('table[name=posts] tbody tr').count()).toBe(0);

        browser().navigateTo('/blog/admin/post/new');

        input('lxForm.model.title').enter('e2e');
        input('lxForm.model.content').enter('e2e Content');
        element('button[name=save]').click();
        sleep(5);

        expect(element('.uneditable-input').text()).toContain('2013-');

        browser().navigateTo('/blog/admin');
        sleep(5);

        expect(repeater('table[name=posts] tbody tr').count()).toBe(1);
    });

    it('should save/delete a tag', function () {
        browser().navigateTo('/blog/admin');
        element('button[name=showTags]').click();

        sleep(1);

        expect(repeater('table[name=tags] tbody tr').count()).toBe(0);

        input('modal.name').enter('tag1');
        element('button[name=saveTag]').click();
        sleep(5);

        expect(repeater('table[name=tags] tbody tr').count()).toBe(1);

        element('button[name=deleteTag]').click();
        sleep(1);

        expect(repeater('table[name=tags] tbody tr').count()).toBe(0);
    });

    it('should reset the form', function () {
        browser().navigateTo('/blog/admin/post/new');

        input('lxForm.model.title').enter('e2e');
        input('lxForm.model.content').enter('e2e Content');
        element('button[name=reset]').click();

        expect(input('lxForm.model.title').val()).toEqual('');
        expect(input('lxForm.model.content').val()).toEqual('');
        expect(element('button[name=reset]').attr('disabled')).toEqual('disabled');
    });
});

describe('Blog Scenarios', function () {
    it('should show all blog posts', function () {
        browser().navigateTo('/blog');
        sleep(5);

        expect(browser().location().url()).toEqual('/blog');
        expect(repeater('article').count()).toBe(1);
    });

    it('should open a single blog posts', function () {
        browser().navigateTo('/blog');
        sleep(1);

        element('article div.entry-excerpt a').click();
        expect(browser().location().url()).toContain('/blog/post/');

        sleep(1);

        expect(element('h2').html()).toEqual('e2e');
        expect(element('div[name=content]').html()).toEqual('e2e Content');
        expect(repeater('div[name=comments]').count()).toBe(0);

        input('newComment.content').enter('Comment 1');
        input('newComment.username').enter('wayne');
        element('button[name=saveComment]').click();
        sleep(1);

        expect(repeater('div[name=comments]').count()).toBe(1);
    });
});