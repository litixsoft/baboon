'use strict';

angular.module('admin', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav',
        'pascalprecht.translate',
        'bbc.transport'
    ])
    .config(function ($routeProvider, $locationProvider, navigationProvider, $translateProvider, transportProvider) {

        // Routing and navigation
        $routeProvider
            .when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                redirectTo: '/admin'
            });

        $locationProvider.html5Mode(true);
        navigationProvider.setCurrentApp('admin');
        transportProvider.set();

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/admin/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .controller('AdminCtrl', function ($scope, transport) {
        transport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
        });

        $scope.view = 'app/admin/admin.html';
    });