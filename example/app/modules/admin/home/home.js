'use strict';

angular.module('admin.home', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/admin/home', {
                templateUrl: 'modules/admin/home/home.html',
                controller: 'AdminHomeCtrl',
                app: 'admin'
            });
    })

  .controller('AdminHomeCtrl', function ($scope) {
        $scope.awesomeThings = [
            {
                name:'HTML5 Boilerplate',
                info: 'HTML5 Boilerplate is a professional front-end template for building fast,' +
                    ' robust, and adaptable web apps or sites.'
            },
            {
                name:'AngularJS',
                info: 'AngularJS is a toolset for building the framework most suited to your application development.'
            },
            {
                name:'Karma',
                info: 'Spectacular Test Runner for JavaScript.'
            }
        ];
  });
