/*global angular*/
angular.module('lx.integer', [])
    .directive('lxInteger', function () {
        var INTEGER_REGEXP = /^\-?\d*$/;

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.push(function (viewValue) {
                    if (!viewValue) {
                        // reset validation
                        ctrl.$setValidity('integer', true);
                        return null;
                    }

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

                ctrl.$formatters.unshift(function (modelValue) {
                    if(modelValue === undefined || modelValue === null) {
                        ctrl.$setValidity('integer', true);
                        return modelValue;
                    }
                    ctrl.$setValidity('integer', !isNaN(modelValue));

                    if (!isNaN(modelValue) && modelValue !== null) {
                        modelValue = parseInt(modelValue, 10).toString();
                    }

                    return modelValue;
                });
            }
        };
    });