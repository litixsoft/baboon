angular.module('blog',[])
    .config(function ($routeProvider) {
        'use strict';

        $routeProvider.when('/foo',{templateUrl: '/blog/views/foo.html', controller: 'FooCtrl'});
    });
