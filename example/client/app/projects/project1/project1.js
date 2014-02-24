'use strict';

angular.module('project1', [
        'ngRoute',
        'ui.bootstrap',
        'common.nav',
        'pascalprecht.translate'
    ])
    .config(function ($routeProvider, $locationProvider, $translateProvider, navigationProvider) {

        $routeProvider
            .when('/project1', {
                templateUrl: 'app/projects/project1/project1.html',
                controller: 'Project1Ctrl',
                app: 'project1'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
        navigationProvider.setCurrentApp('project1');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/projects/project1/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .controller('Project1Ctrl', function ($scope, $http) {
        $http.get('/api/awesomeThings').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            $scope.view = 'app/projects/project1/project1.html';
        });
    });