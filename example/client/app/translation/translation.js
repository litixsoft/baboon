/*global angular*/
angular.module('translation', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/translation', {templateUrl: '/translation/index.html', controller: 'translationCtrl'});
    })
    .controller('translationCtrl', ['$scope', '$translate', 'session', function ($scope, $translate, session) {
        $scope.changeLanguage = function (langKey) {
            // tell angular-translate to use the new language
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey);
        };

        $scope.translationData = {
            name: 'Litixsoft'
        };
    }]);