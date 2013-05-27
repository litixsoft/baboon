/*global angular*/
angular.module('login',[])
    .config(function ($routeProvider) {
        $routeProvider.when('/login', {templateUrl: '/login/login.html', controller: 'loginCtrl'});
    })
    .controller('loginCtrl', ['$scope', 'session', function ($scope, session) {

        $scope.data = {key: 'test', value: 'blub'};

        $scope.setAct = function() {
            console.log('set Act');
            session.setActivity();
        };

        $scope.setData = function() {
            console.log('starte setData');
            session.setData($scope.data, function(err, res) {
                if(err) {
                    console.log(err);
                }
                console.log(res);
            });
        };
        $scope.getAll = function(){
            console.log('starte getAll');
            console.log(session);
            session.getAll(function(err, res) {
                if(err) {
                    $scope.session = 'error: ' + err;
                }
                else {
                    $scope.session = res;
                }

            });
        };
    }]);
