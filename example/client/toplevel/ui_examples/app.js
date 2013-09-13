/*global angular*/
angular.module('ui_app', [
        'pascalprecht.translate',
        'ui_app.base',
        'baboon.module',
        'baboon.services',
        'baboon.directives'
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
    .run(['$rootScope', 'lxSession', '$log', '$translate', '$window', 'msgBox',
        function ($rootScope, lxSession, $log, $translate, $window, msgBox) {
            $rootScope.$on('$routeChangeStart', function () {
                lxSession.setActivity(function(err) {
                    if (err) {
                        msgBox.modal.show('','Session is expired! Please log in.', 'Warning', function () {
                            window.location.assign('/login');
                        });
                    }
                });
            });

            // get users preferred language from session
            lxSession.getData('language', function (error, result) {
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
                lxSession.setData('language', langKey, function(err) {
                    if (err) {
                        $log.error(err);
                    }
                });
            };
        }]);