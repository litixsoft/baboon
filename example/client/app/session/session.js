/*global angular*/
angular.module('sessionDoc', []).
    config(function ($routeProvider) {
        $routeProvider.when('/session', {templateUrl: '/session/session.html', controller: 'sessionDocCtrl'});
    }).
    controller('sessionDocCtrl', ['$scope', function () {}]);
