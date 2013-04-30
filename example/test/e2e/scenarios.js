'use strict';
//angular.scenario.dsl('value', function() {
//    return function(value) {
//        return this.addFuture('value to future', function(done) {
//            done(null, value);
//        });
//    };
//});

/*global describe, it, expect, beforeEach, browser, element */
describe('Enterprise app', function () {

//    beforeEach(function () {
////        browser().navigateTo('../../client/index.html');
//        browser().navigateTo('/');
//    });

    it('should redirect index.html to index.html#/phones', function() {
        browser().navigateTo('/');
//        expect(browser().location().url()).toBe('/phones');
//        console.log(browser().window().href());

        expect(browser().location().url()).toEqual('http://www.google.com');
    });

//    it('contains spec with an expectation', function() {
//        expect(browser().location().url()).toBe('/');
////        expect(value(3)).toBe(3);
//    });

//    it('should automatically redirect to /view1 when location hash/fragment is empty', function () {
//        expect(browser().location().url()).toBe('/view1');
//    });

//    describe('view1', function () {
//
//        beforeEach(function () {
//            browser().navigateTo('#/view1');
//        });
//
//        it('should render view1 when user navigates to /view1', function () {
//            expect(element('[ng-view] p:first').text()).
//                toMatch(/partial for view 1/);
//        });
//
//    });
//
//    describe('view2', function () {
//
//        beforeEach(function () {
//            browser().navigateTo('#/view2');
//        });
//
//        it('should render view2 when user navigates to /view2', function () {
//            expect(element('[ng-view] p:first').text()).
//                toMatch(/partial for view 2/);
//        });
//
//    });
});
