angular.module('NgAppDemo', ['ui.bootstrap', 'bbc.alert']).controller('NgAppDemoCtrl', function ($scope, $bbcAlert) {
    $scope.bbcAlert = $bbcAlert;
    $scope.showAlert = function(type) {
        $scope.bbcAlert[type]('Info message from controller');
    };
});
