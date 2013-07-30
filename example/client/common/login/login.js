/*global angular*/
var success = function(res){
    console.log('success');
    console.log(res);
};

var error = function(err){
    console.log('error:');
    console.log(err);
};

angular.module('login',[])
    .config(function ($routeProvider) {
        $routeProvider.when('/login', {templateUrl: '/login/login.html', controller: 'loginCtrl'});
    })
    .controller('loginCtrl', ['$rootScope', '$scope', 'session', '$http', 'msgBox', function ($rootScope, $scope, session, $http, msgBox) {

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
        $scope.activity = function(){
            console.log('starte activity');
            $http.post('/test/test').
                success(function(data, status) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log('data',data);
                    $rootScope.$apply(function () {
                        msgBox.modal.show('Session is expired! Please log in.', 'Warning', function () {
                            window.location.assign('/login');
                        });
                    });
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log(data);
                    $rootScope.$apply(function () {
                        msgBox.modal.show('Session is expired! Please log in.', 'Warning', function () {
                            window.location.assign('/login');
                        });
                    });
                });
        };
    }]);
