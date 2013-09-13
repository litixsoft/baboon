/*global angular*/
angular.module('lx.float', [])
    .directive('lxFloat', function () {
        var FLOAT_REGEXP = /^\-?\d+((\.|,)?(\d+)?)?$/;

        function roundToDecimal (number, decimal) {
            var zeros = (1.0).toFixed(decimal);
            zeros = zeros.substr(2);
            var mul_div = parseInt('1' + zeros, 10);
            var increment = parseFloat('.' + zeros + '01');

            if (( (number * (mul_div * 10)) % 10) >= 5) {
                number += increment;
            }

            return Math.round(number * mul_div) / mul_div;
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                var numberOfDigits = 2;

                // get the number of digits from attr
                attrs.$observe('lxFloat', function (value) {
                    value = scope.$eval(value);

                    if (typeof value === 'number') {
                        numberOfDigits = value;
                    }
                });

                ctrl.$parsers.push(function (viewValue) {
                    if (!viewValue) {
                        // reset validation
                        ctrl.$setValidity('float', true);
                        return null;
                    }

                    if (FLOAT_REGEXP.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('float', true);

                        return typeof viewValue === 'number' ? roundToDecimal(viewValue, numberOfDigits) : roundToDecimal(parseFloat(viewValue.replace(',', '.')), numberOfDigits);
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('float', false);

                        return undefined;
                    }
                });

                ctrl.$formatters.unshift(function (modelValue) {
                    if(modelValue === undefined || modelValue === null) {
                        ctrl.$setValidity('float', true);
                        return modelValue;
                    }

                    ctrl.$setValidity('float', !isNaN(modelValue));

                    if (!isNaN(modelValue)) {
                        modelValue = parseFloat(modelValue).toFixed(numberOfDigits).replace('.', ',');
                    }

                    return modelValue;
                });
            }
        };
    });