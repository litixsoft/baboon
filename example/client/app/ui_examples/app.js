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
    .controller('rootCtrl', ['$rootScope', 'msgBox', function ($scope, msgBox) {
        $scope.modal = msgBox.modal;
    }])
    .controller('navLoginCtrl', ['$scope', '$window', function ($scope,$window) {

        var window = angular.element($window);

        $scope.$watch('openMenu',function(newval, oldval){
            if(newval){
                window.bind('keydown',function(ev){
                    if ( ev.which == 27 ) { //ESC Key
                        $scope.$apply( function () {
                            $scope.openMenu = false;
                        });
                    }
                });
            } else {
                window.unbind('keydown');
            }
        });

        $scope.openMenu = false;

    }]);