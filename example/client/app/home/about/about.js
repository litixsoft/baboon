/*global angular*/
angular.module('home.about', [])

    // config home module
    .config(function ($routeProvider) {
        $routeProvider.when('/home/about', {templateUrl: 'home/about/about.html', controller: 'homeAboutCtrl'});
    })
    // home controller
    .controller('homeAboutCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.startAdministration = function () {
            $http.post('/admin/startAdministration', {project_id: 123})
                .success(function (data) {
                    console.info(data);
                })
                .error(function (data) {
                    console.error(data);
                });
        };
    }]);
