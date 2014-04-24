'use strict';

angular.module('main.localization', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/localization', { templateUrl: 'app/main/localization/localization.html', controller: 'MainLocalizationCtrl' });
        $routeProvider.when('/localization/edit', { templateUrl: 'app/main/localization/localization.html', controller: 'MainLocalizationCtrl' });
    })
    .controller('MainLocalizationCtrl', function ($scope, $translate) {
        $scope.sampleDate = new Date();
        $scope.sampleNumber = 123456789.98;
        $scope.sampleCurrency = 56789.98;

        $scope.changeLanguage = function (langKey) {
            $translate.use(langKey);
            // save selected language in session
            /*lxSession.setData('language', langKey, function(err) {
                if (err) {
                    console.log(err);
                }
            });*/
        };
    });
