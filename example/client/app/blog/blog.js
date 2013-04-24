angular.module('blog', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/foo', {templateUrl: 'blog/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl', ['$scope', 'enterpriseCrew', 'socket', function ($scope, enterpriseCrew, socket) {
        $scope.enterpriseCrew = enterpriseCrew;

        $scope.send = function () {
            socket.emit('send:test', {name:'Timo Liebetrau'}, function (data) {
                $scope.serverRequest = data;
            });
        };
    }]);