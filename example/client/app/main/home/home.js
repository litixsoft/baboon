'use strict';

angular.module('main.home', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/main/home/home.html',
                controller: 'MainHomeCtrl',
                app: 'main'
            })
            .when('/home', {
                templateUrl: 'app/main/home/home.html',
                controller: 'MainHomeCtrl',
                app: 'main'
            });
    })
    .controller('MainHomeCtrl', function ($scope, transport) {

        $scope.title = 'Home';

        transport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
        });
    });
