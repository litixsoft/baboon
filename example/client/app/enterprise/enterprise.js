/*global angular*/
'use strict';

angular.module('enterprise',['enterprise.services'])
    .config(function($routeProvider){
        $routeProvider.when('/',{templateUrl: '/enterprise/views/list.html', controller: 'ListCtrl'});
        $routeProvider.when('/new',{templateUrl: '/enterprise/views/edit.html', controller: 'NewCtrl'});
        $routeProvider.when('/edit/:id',{templateUrl: '/enterprise/views/edit.html', controller: 'EditCtrl'});
    });
