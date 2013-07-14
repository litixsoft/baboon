/*global angular*/
angular.module('app', [
        'ui.utils',
        'baboon.directives',
        'baboon.services',
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
    .controller('rootCtrl', ['$rootScope', function ($scope) {
        $scope.err = {};

        $scope.modal = {
            opts: {
                backdropFade: true,
                dialogFade: true
            }
        };


    }]);
