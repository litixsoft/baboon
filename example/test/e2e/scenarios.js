'use strict';
//angular.scenario.dsl('value', function() {
//    return function(value) {
//        return this.addFuture('value to future', function(done) {
//            done(null, value);
//        });
//    };
//});

/*global describe, it, expect, browser, element */
describe('Enterprise app', function () {

//    beforeEach(function () {
////        browser().navigateTo('../../client/index.html');
//        browser().navigateTo('/');
//    });

    it('should redirect index.html', function () {
        browser().navigateTo('/');

        expect(browser().location().url()).toEqual('/');
    });

    it('should redirect index.html when some unknown url is entered', function () {
        browser().navigateTo('/dasdsasda');

        expect(browser().location().url()).toEqual('/');
    });

    it('should redirect to edit.html when Add New Member is clicked', function () {
        browser().navigateTo('/enterprise');
        element('table thead tr td a', 'Add New').click();

        expect(browser().location().url()).toEqual('/enterprise/new');
    });

//    it('should redirect to edit.html when Add New Member is clicked', function () {
//        browser().navigateTo('/');
//
////        expect(repeater('table tbody tr').count()).toBe(3);
////        expect(element('table tbody tr', 'Crew Members').count()).toBe(3);
//    });
});
