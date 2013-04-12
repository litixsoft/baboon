/*global angular*/
angular.module('app',['enterprise', 'blog'])
    .config(function ($routeProvider, $locationProvider) {
        'use strict';
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .service('socket', function ($rootScope) {
        'use strict';
        // test
        $rootScope.test = 'Das ist der Socket Test';
    });