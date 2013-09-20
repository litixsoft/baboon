/*global angular*/
angular.module('ui.if', []).directive('uiIf', [function () {
    return {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        restrict: 'A',
        compile: function (element, attr, transclude) {
            return function (scope, element, attr) {

                var childElement;
                var childScope;

                scope.$watch(attr.uiIf, function (newValue) {
                    if (childElement) {
                        childElement.remove();
                        childElement = undefined;
                    }
                    if (childScope) {
                        childScope.$destroy();
                        childScope = undefined;
                    }

                    if (newValue) {
                        childScope = scope.$new();
                        transclude(childScope, function (clone) {
                            childElement = clone;
                            element.after(clone);
                        });
                    }
                });
            };
        }
    };
}]);