/*global angular*/
angular.module('login', ['login.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/login', {templateUrl: '/login/login.html', controller: 'loginCtrl'});
    })
    .controller('loginCtrl', ['$scope', 'session', function ($scope, session) {

        $scope.isAuthenticated = false;

        session.getUsername(function(data){
            $scope.username = data;
        });

        session.isAuthenticated(function(data){
            $scope.isAuthenticated = data;
        });
    }]);
