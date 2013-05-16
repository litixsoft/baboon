/*global angular*/
angular.module('vendor', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/vendor', {templateUrl: 'vendor/vendor.html', controller: 'vendorCtrl'});
    })
    .controller('vendorCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-vendor';
    }]);