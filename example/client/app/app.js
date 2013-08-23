/*global angular*/
angular.module('app', [
        'ui.utils',
        'ui.bootstrap',
        'pascalprecht.translate',
        'baboon.services',
        'baboon.directives',
        'blog',
        'enterprise',
        'home',
        'translation',
        'cache',
        'admin',
        'login',
        'ui.lxnavigation',
        'sessionDoc'
    ])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});

        $translateProvider.useStaticFilesLoader({
            prefix: 'locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
    }])
    .run(['$rootScope', 'session', '$log', '$translate', function ($rootScope, session, $log, $translate) {
        $rootScope.$on('$routeChangeStart', function () {
            session.setActivity();
        });

        // get users preferred language from session
        session.getData('language', function (error, result) {
            if (error) {
                $log.error(error);
            }

            // use language
            if (result && result.language) {
                $translate.uses(result.language);
                $log.info('Language key loaded from session: ' + result.language);
            }
        });
    }])
    .controller('rootCtrl', ['$rootScope', 'msgBox', function ($scope, msgBox) {
        $scope.modal = msgBox.modal;
    }])
    .controller('navLoginCtrl', ['$scope', '$window', function ($scope,$window) {

        var window = angular.element($window);

        $scope.$watch('openMenu',function(newval){
            if(newval){
                window.bind('keydown',function(ev){
                    if ( ev.which === 27 ) { //ESC Key
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


