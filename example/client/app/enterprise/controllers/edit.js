/*jshint unused:false */
function EditCtrl($scope, $location, $routeParams) {
    'use strict';

    $scope.person = $scope.crew[$routeParams.id];
    $scope.save = function () {
        $location.path('/');
    };
}
