
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
    .controller('MainContactCtrl', function ($scope, $bbcTransport, $log) {

        $scope.title = 'Contact';

        $bbcTransport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
            else {
                $scope.awesomeThings = [];
                $log.error(error);
            }
        });
    });