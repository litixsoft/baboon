/*jshint unused:false */
function NewCtrl($scope, $location) {
    'use strict';

    $scope.person = {name: '', description: ''};
    $scope.save = function() {
        $scope.crew.push($scope.person);
        $location.path('/');
    };
}
