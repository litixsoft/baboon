
'use strict';

angular.module('demo.enterprise', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/demo/enterprise', {
                templateUrl: 'app/demo/enterprise/enterprise.html',
                controller: 'DemoEnterpriseCtrl'
            });
    })
    .controller('DemoEnterpriseCtrl', function ($scope, $bbcTransport, $log) {

        $scope.title = 'Enterprise';

//        $bbcTransport.emit('api/common/awesomeThings/index/getAll', function (error, result){
//            if (!error && result) {
//                $scope.awesomeThings = result;
//            }
//            else {
//                $scope.awesomeThings = [];
//                $log.error(error);
//            }
//        });
    });