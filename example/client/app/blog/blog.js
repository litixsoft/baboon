angular.module('blog', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/foo', {templateUrl: 'blog/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl', ['$scope', 'enterpriseCrew', 'socket', function ($scope, enterpriseCrew, socket) {
        enterpriseCrew.getAll(function(data) {
            $scope.enterpriseCrew = data;
        });

        $scope.send = function () {
            socket.emit('blog:test', {name:'Timo Liebetrau'}, function (data) {
                $scope.serverRequest = data;
            });
        };
    }]);