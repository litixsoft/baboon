/*global angular*/
angular.module('login', ['login.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/login', {templateUrl: '/login/login.html', controller: 'loginCtrl'});
    })
    .controller('loginCtrl', ['$scope', 'session', function ($scope, session) {
        session.getAll(function (data) {
            $scope.session = data;
        });
    }]);
