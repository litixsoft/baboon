/*global angular*/
angular.module('ui.bootstrap', [

    /* start required directives */

    'ui.bootstrap.transition',
    'ui.bootstrap.position',

    /* end required directives */

    /* start optional directives */

    /* collapse */
    'ui.bootstrap.collapse',

    /* accordion */
    'ui.bootstrap.accordion',
    'template/accordion/accordion-group.html',
    'template/accordion/accordion.html',

    /* alert */
    'ui.bootstrap.alert',
    'template/alert/alert.html',

    /* buttons */
    'ui.bootstrap.buttons',

    /* carousel */
    'ui.bootstrap.carousel',
    'template/carousel/carousel.html',
    'template/carousel/slide.html',

    /* datepicker */
    'ui.bootstrap.datepicker',
    'template/datepicker/datepicker.html',

    /* dialog */
    'ui.bootstrap.dialog',
    'template/dialog/message.html',

    /* dropdownToggle */
    'ui.bootstrap.dropdownToggle',

    /* modal */
    'ui.bootstrap.modal',

    /* pagination */
    'ui.bootstrap.pagination',
    'template/pagination/pager.html',
    'template/pagination/pagination.html',

    /* tooltip */
    'ui.bootstrap.tooltip',
    'template/tooltip/tooltip-html-unsafe-popup.html',
    'template/tooltip/tooltip-popup.html',

    /* popover */
    'ui.bootstrap.popover',
    'template/popover/popover.html',

    /* progressbar */
    'ui.bootstrap.progressbar',
    'template/progressbar/bar.html',
    'template/progressbar/progress.html',

    /* rating */
    'ui.bootstrap.rating',
    'template/rating/rating.html',

    /* tabs */
    'ui.bootstrap.tabs',
    'template/tabs/tab.html',
    'template/tabs/tabset.html',

    /* timepicker */
    'ui.bootstrap.timepicker',
    'template/timepicker/timepicker.html',

    /* typeahead */
    'ui.bootstrap.typeahead',
    'template/typeahead/typeahead-match.html',
    'template/typeahead/typeahead-popup.html'

    /* end optional directives */
]);

