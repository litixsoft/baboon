/*global angular*/
angular.module('extend', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/extend', {templateUrl: 'extend/extend.html', controller: 'extendCtrl'});
    })
    .controller('extendCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-Extend';
    }]);