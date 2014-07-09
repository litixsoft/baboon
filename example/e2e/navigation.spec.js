'use strict';

describe('Scenario: User navigates the application.', function () {

    it('should be the correct scope by route /', function() {
        browser.get('/');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /foo', function() {
        browser.get('/foo');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /main', function() {
        browser.get('/main');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /main/home', function() {
        browser.get('/main/home');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /main/about', function() {
        browser.get('/main/about');

        var view = element(by.binding('view'));
        expect(view.getText()).toEqual('This is the: about view and the: MainHomeAboutCtrl controller.');
    });

    it('should be the correct scope by route /main/contact', function() {
        browser.get('/main/contact');

        var view = element(by.binding('view'));
        expect(view.getText()).toEqual('This is the: contact view and the: MainHomeContactCtrl controller.');
    });

    it('should be the correct scope by route /admin', function() {
        browser.get('/admin');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /admin/foo', function() {
        browser.get('/admin/foo');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });

    it('should be the correct scope by route /admin/home', function() {
        browser.get('/admin/home');

        var thingList = element.all(by.repeater('thing in awesomeThings'));
        expect(thingList.count()).toEqual(3);
    });
});