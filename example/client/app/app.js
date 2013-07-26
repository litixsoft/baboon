/*global angular*/
angular.module('app', [
        'ui.utils',
        'ui.bootstrap',
        'baboon.services',
        'baboon.directives',
        'blog',
        'enterprise',
        'home',
        'cache',
        'login'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .run(['$rootScope', 'session', function ($rootScope, session) {
        $rootScope.$on('$routeChangeStart', function () {
            session.setActivity();
        });
    }])
    .controller('rootCtrl', ['$rootScope', 'msgBox', function ($scope, msgBox) {
        $scope.modal = msgBox.modal;
    }]);
