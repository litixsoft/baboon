/*global angular*/
angular.module('lx.integer', [])
    .directive('lxInteger', function () {
        var INTEGER_REGEXP = /^\-?\d*$/;

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.push(function (viewValue) {
                    if (INTEGER_REGEXP.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('integer', true);

                        return parseInt(viewValue, 10);
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('integer', false);

                        return undefined;
                    }
                });
            }
        };
    });