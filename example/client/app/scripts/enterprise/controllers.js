/*jshint unused:false */

function ListCtrl($scope, crew) {
    'use strict';
}
//
function EditCtrl($scope, $location, $routeParams) {
    'use strict';

    $scope.person = $scope.crew[$routeParams.id];
    $scope.save = function () {
        $location.path('/');
    };
}
function NewCtrl($scope, $location) {
    'use strict';

    $scope.person = {name: '', description: ''};
    $scope.save = function() {
        $scope.crew.push($scope.person);
        $location.path('/');
    };
}