'use strict';

/*global describe, it, expect, browser, element, sleep */
describe('Enterprise Scenarios', function () {

    it('should redirect to edit.html when Add New Member is clicked', function () {
        browser().navigateTo('/enterprise');
        element('.panel-body .btn-group a.btn-default', 'Add new crew member').click();

        expect(browser().location().url()).toEqual('/enterprise/new');
    });

    it('should show all crew members', function () {
        browser().navigateTo('/enterprise');
        sleep(1);

        expect(browser().location().url()).toEqual('/enterprise');
//        expect(repeater('article').count()).toBe(1);
    });
});