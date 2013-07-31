/*global angular*/

angular.module('login',[])
    .config(function ($routeProvider) {
        $routeProvider.when('/login', {templateUrl: '/login/login.html', controller: 'loginCtrl'});
    })
    .controller('loginCtrl', ['$scope', 'session', function ($scope, session) {

        $scope.data = {key: 'test', value: 'blub'};

        $scope.setActivity = function() {
            console.log('set Act');
            session.setActivity();
        };

        $scope.setData = function() {
            console.log('starte setData');
            session.setData($scope.data);
        };

        $scope.getData = function() {
            console.log('starte getData');
            session.getData($scope.data, function(err, res) {
                if(! err) {
                    $scope.session = res;
                }
            });
        };
    }]);
