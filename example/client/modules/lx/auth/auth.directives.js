/*global angular*/
angular.module('lx.auth.directives', ['lx/auth/tpls/auth_popup.html'])
    .directive('lxAuthPopup', function () {
        return {
            restrict: 'E',
            controller: 'lxAuthLoginCtrl',
            transclude: true,
            replace: true,
            templateUrl: 'lx/auth/tpls/auth_popup.html'
        };
    });