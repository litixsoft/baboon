angular.module('enterprise', [
        'enterprise.services'
    ])
/**
 * Enterprise config area
 */
    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: '/views/enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/new', {templateUrl: '/views/enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/edit/:id', {templateUrl: '/views/enterprise/edit.html', controller: 'editCtrl'});
    })
/**
 * Enterprise controller
 */
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', function ($scope) {
        $scope.alerts = [
            { type: 'error', msg: 'Oh snap! Change a few things up and try submitting again.' },
            { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
        ];

        $scope.addAlert = function() {
            $scope.alerts.push({msg: 'Another alert!'});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

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
    .controller('editCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {

        $scope.person = $scope.enterpriseCrew[$routeParams.id];
        $scope.save = function () {
            $location.path('/');
        };
    }])
/**
 * Enterprise new controller
 */
    .controller('newCtrl', ['$scope', '$location', function ($scope, $location) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            $scope.enterpriseCrew.push($scope.person);
            $location.path('/');
        };
    }]);
