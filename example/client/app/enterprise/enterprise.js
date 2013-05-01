angular.module('enterprise', [
        'enterprise.services'
    ])
/**
 * Enterprise config area
 */
    .config(function ($routeProvider) {
        $routeProvider.when('/enterprise', {templateUrl: 'enterprise/views/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/enterprise/new', {templateUrl: 'enterprise/views/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/enterprise/edit/:id', {templateUrl: 'enterprise/views/edit.html', controller: 'editCtrl'});
    })
/**
 * Enterprise controller
 */
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', function ($scope, enterpriseCrew) {

        enterpriseCrew.getAll(function(data) {
            $scope.enterpriseCrew = data;
        });

        $scope.open = function () {
            $scope.shouldBeOpen = true;
        };

        $scope.close = function () {
            $scope.closeMsg = 'I was closed at: ' + new Date();
            $scope.shouldBeOpen = false;
        };

        $scope.items = ['item1', 'item2'];

        $scope.opts = {
            backdropFade: true,
            dialogFade:true
        };
    }])
/**
 * Enterprise edit controller
 */
    .controller('editCtrl', ['$scope', '$location', '$routeParams', 'enterpriseCrew', function ($scope, $location, $routeParams, enterpriseCrew) {

        enterpriseCrew.getById([$routeParams.id], function(data) {
            $scope.person = data;
        });

        $scope.save = function () {
            enterpriseCrew.updateById($routeParams.id, $scope.person, function() {
                $location.path('/enterprise');
            });
        };
    }])
/**
 * Enterprise new controller
 */
    .controller('newCtrl', ['$scope', '$location','enterpriseCrew', function ($scope, $location, enterpriseCrew) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            enterpriseCrew.create($scope.person, function() {
                $location.path('/enterprise');
            });
        };
    }]);