'use strict';

describe('Navigation', function () {

    var title;

    beforeEach(function () {
        browser.get('/');
        title = element(by.tagName('h2'));
    });

    it('should automatically redirect to home view when location hash/fragment is empty', function () {
        expect(title.getText()).toEqual('Home view');
    });

    describe('about', function () {

        var title;

        beforeEach(function () {
            browser.get('/about');
            title = element(by.tagName('h2'));
        });

        it('should render about when user navigates to /about', function () {
            expect(title.getText()).toEqual('About view');
        });

    });

    describe('contact', function () {

        var title;

        beforeEach(function () {
            browser.get('/contact');
            title = element(by.tagName('h2'));
        });

        it('should render contact when user navigates to /contact', function () {
            expect(title.getText()).toEqual('Contact view');
        });

    });
});