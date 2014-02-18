'use strict';

angular.module('admin', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav',
        'pascalprecht.translate'
    ])
    .config(function ($routeProvider, $locationProvider, $translateProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl'
            })
            .when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/admin/locale/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('de-de');
        $translateProvider.fallbackLanguage('de-de');
    })
    .controller('AdminCtrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/admin/admin.html';
        });
    });
