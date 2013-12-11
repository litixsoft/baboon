/*global angular*/
angular.module('datepickerExample', []).
    config(function ($routeProvider) {
        $routeProvider.when('/datepicker', {templateUrl: 'datepicker/datepicker.html', controller: 'datepickerExampleCtrl'});
    })
    .controller('datepickerExampleCtrl', ['$scope','lxModal', function ($scope, lxModal) {

        $scope.datum = '';
        $scope.datum2 = '';


        $scope.sendForm = function(){
            console.log('das Datum: '+$scope.datum);
            console.log('das Datum2: '+$scope.datum2);
        };

    }]);