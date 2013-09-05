/*global angular*/
angular.module('lx.float', [])
    .directive('lxFloat', function () {
        var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.push(function (viewValue) {
                    if (FLOAT_REGEXP.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('float', true);

                        return typeof viewValue === 'number' ? viewValue : parseFloat(viewValue.replace(',', '.'));
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('float', false);

                        return undefined;
                    }
                });

                ctrl.$formatters.unshift(function (modelValue) {
                    if (typeof modelValue === 'number') {
                        modelValue = modelValue.toFixed(2).replace('.', ',');
                    }

                    return modelValue;
                });
            }
        };
    });