/*global angular*/
angular.module('baboon.msgBox.tpl/msgBox.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('baboon.msgBox.tpl/msgBox.html',
        '<div class="">\n ' +
            '<div class="modal-header">\n ' +
                '<h4>{{ modal.type }}</h4>\n ' +
                '<p>{{ modal.headline}}</p>\n ' +
            '</div>\n ' +
            '<div class="modal-body">\n ' +
                '<div class="row-fluid">\n ' +
                    '<div class="span3">\n ' +
                        '<div class="icon"></div>\n ' +
                    '</div>\n ' +
                    '<div class="span9">\n ' +
                        '<h4>{{ modal.message }}</h4>\n ' +
                    '</div>\n ' +
                '</div>\n ' +
            '</div>\n ' +
            '<div class="modal-footer">\n ' +
                '<button class="btn btn-primary" ng-click="modal.yes()" ng-show="!!modal.actionYes">Yes</button>\n ' +
                '<button class="btn btn-primary" ng-click="modal.no()" ng-show="!!modal.actionNo">No</button>\n ' +
                '<button class="btn" ng-click="modal.close()" ng-show="!!modal.actionClose">Close</button>\n ' +
                '<button class="btn btn-primary" ng-click="modal.ok()" ng-show="!!modal.actionOk">Ok</button>\n ' +
            ' </div>\n ' +
        '</div>'
    );
}]);