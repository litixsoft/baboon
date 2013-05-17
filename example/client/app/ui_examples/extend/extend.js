/*global angular*/
angular.module('extend', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/extend', {templateUrl: '/ui_examples/extend/extend.html', controller: 'extendCtrl'});
    })
    .controller('extendCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-Extend';
    }]);