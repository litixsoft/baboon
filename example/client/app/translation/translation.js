/*global angular*/
angular.module('app.translation', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/translation', {templateUrl: 'translation/translation.html', controller: 'appTranslationCtrl'});
    })
    .controller('appTranslationCtrl', ['$scope', '$translate', 'lxSession', '$log',
        function ($scope, $translate, lxSession, $log) {
        $scope.changeLanguage = function (langKey) {
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