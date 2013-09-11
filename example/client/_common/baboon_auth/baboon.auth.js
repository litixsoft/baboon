/*global angular*/
angular.module('baboon.auth',  ['baboon.auth.services'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/api/auth/register', {templateUrl: '/baboon_auth/register.html'});
    }])
    .controller('baboon.auth.loginCtrl', ['$scope', '$window', 'auth', function ($scope, $window, auth) {

        var window = angular.element($window);

        $scope.$watch('openMenu',function(newval){
            if(newval){
                window.bind('keydown',function(ev){
                    if ( ev.which === 27 ) { //ESC Key
                        $scope.$apply( function () {
                            $scope.openMenu = false;
                        });
                    }
                });
            } else {
                window.unbind('keydown');
            }
        });

        $scope.authFailed = false;
        $scope.serverError = false;
        $scope.openMenu = false;

        $scope.login = function() {

            /* -----------Begin:  workaround for autofill ------ */

            var user = document.getElementsByName('username');
            $scope.username = user[0].value;

            var pass = document.getElementsByName('password');
            $scope.password = pass[0].value;

            /* -----------End:  workaround for autofill ------ */


            auth.login($scope.username, $scope.password, function(err, res) {
                if(res && ! err) {
                    $window.location.reload();
                }
                else {
                    if (err.status === 403) {
                        $scope.authFailed = true;
                    }
                    else {
                        $scope.serverError = true;
                    }
                }
            });
        };
        $scope.logout = function() {
            console.log('logout');
        };
        $scope.register = function() {
            console.log('register');
        };

    }]);
