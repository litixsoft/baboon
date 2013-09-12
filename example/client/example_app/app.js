/*global angular*/
angular.module('app', [
        'pascalprecht.translate',
        'ui.utils',
        'ui.bootstrap',
        'baboon.auth',
        'baboon.nav',
        'baboon.services',
        'baboon.directives',
        'blog',
        'enterprise',
        'home',
        'translation',
        'cache',
        'sessionDoc'
    ])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
    }])
    .run(['$rootScope', 'session', '$log', '$translate', '$window', 'msgBox',
        function ($rootScope, session, $log, $translate, $window, msgBox) {
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

        $rootScope.modal = msgBox.modal;

        $rootScope.changeLanguage = function (langKey) {
            // tell angular-translate to use the new language
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey, function(err) {
                if (err) {
                    $log.error(err);
                }
            });
        };
    }]);
//    .controller('rootCtrl', ['$rootScope', 'msgBox', '$translate', 'session', '$log', function ($scope, msgBox, $translate, session, $log) {
//        $scope.modal = msgBox.modal;
//
//        $scope.changeLanguage = function (langKey) {
//            // tell angular-translate to use the new language
//            $translate.uses(langKey);
//
//            // save selected language in session
//            session.setData('language', langKey, function(err) {
//                if (err) {
//                    $log.error(err);
//                }
//            });
//        };
//    }]);


