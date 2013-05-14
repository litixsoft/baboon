/**
 * Created with JetBrains WebStorm.
 * User: Sven Bernstein
 * Date: 14.05.13
 * Time: 15:02
 * To change this template use File | Settings | File Templates.
 */
angular.module('extend', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/extend', {templateUrl: 'extend/extend.html', controller: 'extendCtrl'});
    })
    .controller('extendCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-Extend';
    }])