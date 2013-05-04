'use strict';
//angular.scenario.dsl('value', function() {
//    return function(value) {
//        return this.addFuture('value to future', function(done) {
//            done(null, value);
//        });
//    };
//});

///*global describe, it, expect, browser, repeater, sleep */
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
        browser().navigateTo('/wayne');

        expect(browser().location().url()).toEqual('/');
    });

    it('should redirect to edit.html when Add New Member is clicked', function () {
        browser().navigateTo('/enterprise');
        element('table thead tr td a', 'Add New').click();

        expect(browser().location().url()).toEqual('/enterprise/new');
    });

    it('should redirect to edit.html when Add New Member is clicked', function () {
        browser().navigateTo('/');
        expect(browser().location().url()).toEqual('/');
        browser().navigateTo('/enterprise');
        expect(browser().location().url()).toEqual('/enterprise');
        //console.log(repeater('table tbody tr').count());

        //expect(repeater('table tbody tr').count()).toBe(3);
    });
});
