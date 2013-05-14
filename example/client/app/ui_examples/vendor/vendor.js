/**
 * Created with JetBrains WebStorm.
 * User: Sven Bernstein
 * Date: 14.05.13
 * Time: 15:13
 * To change this template use File | Settings | File Templates.
 */
angular.module('vendor', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/vendor', {templateUrl: 'vendor/vendor.html', controller: 'vendorCtrl'});
    })
    .controller('vendorCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-vendor';
    }])