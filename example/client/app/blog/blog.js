/*global angular*/
angular.module('blog',[])
    .config(function ($routeProvider) {
        'use strict';

        $routeProvider.when('/foo',{templateUrl: '/views/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl',['$scope', 'enterpriseCrew', function($scope, enterpriseCrew) {
        'use strict';
    }]);
