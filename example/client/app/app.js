/*global angular*/
angular.module('app', [
        'ui.utils',
        'ui.bootstrap',
        'lx.fileUpload',
        'lx.float',
        'lx.integer',
        'lx.pager',
        'lx.sort',
        'baboon.core',
        'lx.form',
        'lx.InlineEdit',
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
