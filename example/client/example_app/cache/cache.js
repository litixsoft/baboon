/*global angular*/
angular.module('cache', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/cache', {templateUrl: '/cache/cache.html', controller: 'cacheCtrl'});
    })
    .controller('cacheCtrl', ['$scope', 'lxCache', function ($scope, lxCache) {
        $scope.cache = lxCache;
    }]);