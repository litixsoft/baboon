angular.module('enterprise', [
        'enterpriseServices'
    ])
    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: '/views/enterprise/enterprise.html', controller: 'listCtrl'});
        $routeProvider.when('/new', {templateUrl: '/views/enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/edit/:id', {templateUrl: '/views/enterprise/edit.html', controller: 'editCtrl'});
    })
    .controller('listCtrl', ['$scope', 'enterpriseCrew', function () {

    }])
    .controller('editCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
        $scope.person = $scope.enterpriseCrew[$routeParams.id];
        $scope.save = function () {
            $location.path('/');
        };
    }])
    .controller('newCtrl', ['$scope', '$location', function ($scope, $location) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            $scope.enterpriseCrew.push($scope.person);
            $location.path('/');
        };
    }]);