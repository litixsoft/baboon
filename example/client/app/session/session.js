/*global angular*/
angular.module('sessionDoc', []).
    config(function ($routeProvider) {
        $routeProvider.when('/session', {templateUrl: '/session/session.html', controller: 'sessionDocCtrl'});
    }).
    controller('sessionDocCtrl', ['$scope', 'session', '$log', function ($scope, session, $log) {

        $scope.activityMsg = [];

        $scope.getLastActivity = function() {
            session.getLastActivity(function(err, data) {
                if(err) {
                    $log.error(err);
                    $scope.activityMsg.push(err);
                }
                else {
                    var now = new Date(data.activity);
                    $scope.activityMsg.push('last activity is ' + now);
                }
            });
        };
        $scope.setActivity = function(){
            var now = new Date();
            $scope.activityMsg.push('set activity to ' + now);
            session.setActivity();
        };
        $scope.clearActivityMsg = function() {
            $scope.activityMsg = [];
        };
    }]);
