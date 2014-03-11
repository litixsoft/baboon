
'use strict';

angular.module('main.contact', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/contact', {
                templateUrl: 'app/main/contact/contact.html',
                controller: 'MainContactCtrl',
                app: 'main'
            });
    })
    .controller('MainContactCtrl', function ($scope, transport) {
        transport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
        });

        $scope.view = 'app/main/contact/contact.html';
    });