/*global angular*/
angular.module('home', ['home.about'])
    // config home module
    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: '/home/home.html', controller: 'homeCtrl'});
        $routeProvider.when('/home', {templateUrl: '/home/home.html', controller: 'homeCtrl'});
    })
    // home controller
    .controller('homeCtrl', ['$scope', '$translate', 'session', function ($scope, $translate, session) {
        $scope.changeLanguage = function (langKey) {
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey);
        };

        $scope.translationData = {
            name: 'Litixsoft'
        };
    }]);