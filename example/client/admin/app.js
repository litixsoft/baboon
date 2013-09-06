/*global angular*/
angular.module('baboon.admin', [
        'pascalprecht.translate',
        'ui.utils',
        'ui.bootstrap',
        'baboon.services',
        'baboon.directives',
        'ui.lxnavigation',
        'admin'
    ])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/admin', {templateUrl: '/admin/administration.html'});
        $routeProvider.otherwise({redirectTo: '/admin'});

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
    }])
    .run(['$rootScope', 'session', '$log', '$translate', '$window', function ($rootScope, session, $log, $translate, $window) {
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
            } else {
                // detect language of browser
                var browserLanguage = $window.navigator.language || $window.navigator.userLanguage;
                $translate.uses(browserLanguage.substring(0, 2));
            }
        });
    }])
    .controller('rootCtrl', ['$rootScope', 'msgBox', '$translate', 'session', '$log', function ($scope, msgBox, $translate, session, $log) {
        $scope.modal = msgBox.modal;

        $scope.changeLanguage = function (langKey) {
            // tell angular-translate to use the new language
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey, function(err) {
                if (err) {
                    $log.error(err);
                }
            });

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
