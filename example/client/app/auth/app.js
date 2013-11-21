/*global angular*/
angular.module('app', [
        'ngRoute',
        'ngAnimate',
        'ui.bootstrap',
        'app.includes'
    ])
    .constant('USE_SOCKET', true)
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/login', {templateUrl: 'lx/auth/tpls/auth_view_login.html', controller: 'lxAuthViewLoginCtrl'});
        $routeProvider.otherwise({redirectTo: '/login'});

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
    }])
    .run(['$rootScope', 'lxSession', '$log', '$translate', '$window', 'lxModal',
        function ($rootScope, lxSession, $log, $translate, $window, lxModal) {
            $rootScope.$on('$routeChangeStart', function () {
                lxSession.setActivity(function (error) {
                    if (error) {
                        lxModal.show('', 'Session is expired! Please log in.', 'Warning', function () {
                            window.location.assign('/login');
                        });
                    }
                });
            });

            // get users preferred language from session
            lxSession.getData('language', function (error, result) {
                if (error) {
                    // detect language of browser
                    var browserLanguage = $window.navigator.language || $window.navigator.userLanguage;
                    $translate.uses(browserLanguage.substring(0, 2));
                }
                else {
                    // use language
                    $translate.uses(result.language);
                }
            });

            $rootScope.modal = lxModal;

            $rootScope.changeLanguage = function (langKey) {
                // tell angular-translate to use the new language
                $translate.uses(langKey);

                // save selected language in session
                lxSession.setData('language', langKey, function (error) {
                    if (error) {
                        $log.error(error);
                    }
                });
            };
        }]);