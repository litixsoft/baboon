'use strict';

describe('Scenario: User navigates the application.', function () {

    it('should be the correct scope by route /', function() {
        browser.get('/');

        var view = element(by.binding('view'));
        var thingList = element.all(by.repeater('thing in awesomeThings'));

        expect(thingList.count()).toEqual(4);
        expect(view.getText()).toEqual('main/home/home');
    });

    it('should be the correct scope by route /home', function() {
        browser.get('/home');

        var view = element(by.binding('view'));
        var thingList = element.all(by.repeater('thing in awesomeThings'));

        expect(thingList.count()).toEqual(4);
        expect(view.getText()).toEqual('main/home/home');
    });

    it('should be the correct scope by route /about', function() {
        browser.get('/about');

        var view = element(by.binding('view'));
        var thingList = element.all(by.repeater('thing in awesomeThings'));

        expect(thingList.count()).toEqual(4);
        expect(view.getText()).toEqual('main/about/about');
    });

    it('should be the correct scope by route /contact', function() {
        browser.get('/contact');

        var view = element(by.binding('view'));
        var thingList = element.all(by.repeater('thing in awesomeThings'));

        expect(thingList.count()).toEqual(4);
        expect(view.getText()).toEqual('main/contact/contact');
    });

    it('should be the correct scope by route /admin', function() {
        browser.get('/admin');

        var view = element(by.binding('view'));
        var thingList = element.all(by.repeater('thing in awesomeThings'));

        expect(thingList.count()).toEqual(4);
        expect(view.getText()).toEqual('admin/admin');
    });
});