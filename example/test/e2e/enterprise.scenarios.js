'use strict';

/*global describe, it, expect, browser, element */
describe('Enterprise Scenarios', function () {

    it('should redirect to edit.html when Add New Member is clicked', function () {
        browser().navigateTo('/enterprise');
        element('table thead tr td a', 'Add New').click();

        expect(browser().location().url()).toEqual('/enterprise/new');
    });
});