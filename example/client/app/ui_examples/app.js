/*global angular*/
angular.module('ui_app', [
        'ui.utils',
        'ui.bootstrap',
        'baboon.services',
        'baboon.directives',
        'ui_app.base',
        'login',
        'ui.lxnavigation'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/ui'});
    })
    .run(['$rootScope', 'session', function ($rootScope, session) {
        $rootScope.$on('$routeChangeStart', function () {
            session.setActivity();
        });
    }])
    .directive('markdown', function () {
        var converter = new Showdown.converter();

        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.ngModel, function (value) {
                    var htmlText = converter.makeHtml(value || '');
                    element.html(htmlText);
                });
            }
        };
    })
    .controller('rootCtrl', ['$rootScope', 'msgBox', function ($scope, msgBox) {
        $scope.modal = msgBox.modal;
    }]);