/*global angular*/
angular.module('app', [
        'pascalprecht.translate',
        'ui.utils',
        'ui.bootstrap',
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
    .controller('rootCtrl', ['$rootScope', 'msgBox', '$translate', 'session', function ($scope, msgBox, $translate, session) {
        $scope.modal = msgBox.modal;

        $scope.changeLanguage = function (langKey) {
            // tell angular-translate to use the new language
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey);
        };
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


