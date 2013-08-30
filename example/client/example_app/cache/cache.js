/*global angular*/
angular.module('cache', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/cache', {templateUrl: '/cache/cache.html', controller: 'cacheCtrl'});
    })
    .controller('cacheCtrl', ['$scope', 'cache', function ($scope, cache) {
        $scope.cache = cache;
    }]);