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

        transport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
        });

        $scope.view = 'app/main/home/home.html';

//        $http.get('/api/awesomeThings').success(function (awesomeThings) {
//            $scope.awesomeThings = awesomeThings;
//            $scope.view = 'app/main/home/home.html';
//        });
    });
