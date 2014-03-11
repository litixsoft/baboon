
'use strict';

angular.module('main.about', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/about', {
                templateUrl: 'app/main/about/about.html',
                controller: 'MainAboutCtrl',
                app: 'main'
            });
    })
    .controller('MainAboutCtrl', function ($scope, transport) {

        transport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
        });

        $scope.view = 'app/main/about/about.html';
    });