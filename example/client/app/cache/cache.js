/*global angular*/
angular.module('cache', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/cache', {templateUrl: '/cache/cache.html', controller: 'appCacheCtrl'});
    })
    .controller('appCacheCtrl', ['$scope', 'lxCache', function ($scope, lxCache) {
        $scope.cache = lxCache;
    }]);