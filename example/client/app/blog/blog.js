angular.module('blog', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/foo', {templateUrl: 'blog/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl', ['$scope', 'enterpriseCrew', 'socket', function ($scope, enterpriseCrew, socket) {
        $scope.enterpriseCrew = enterpriseCrew;
        socket.on('send:name', function (data) {
            $scope.name = data.name;
        });
        socket.on('send:time', function (data) {
            $scope.time = data.time;
        });
    }]);