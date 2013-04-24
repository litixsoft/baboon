angular.module('enterprise', [
        'enterprise.services'
    ])
/**
 * Enterprise config area
 */

    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/new', {templateUrl: 'enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/edit/:id', {templateUrl: 'enterprise/edit.html', controller: 'editCtrl'});
    })
/**
 * Enterprise controller
 */
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', function ($scope, enterpriseCrew) {
//        $scope.alerts = [
//            { type: 'error', msg: 'Oh snap! Change a few things up and try submitting again.' },
//            { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//        ];

        $scope.enterpriseCrew = enterpriseCrew;

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
    .controller('TypeaheadCtrl', ['$scope', function ($scope) {

        $scope.selected = undefined;
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

        $scope.typeaheadFn = function(query, callback) {
           // $http.get('/stations/autocomplete?term='+query).success(function(stations) {
            callback($scope.states); // This will automatically open the popup with retrieved results
           // });
        };
    }])



/**
 * Enterprise edit controller
 */
    .controller('editCtrl', ['$scope', '$location', '$routeParams', 'enterpriseCrew', function ($scope, $location, $routeParams, enterpriseCrew) {

        $scope.person = enterpriseCrew[$routeParams.id];
        $scope.save = function () {
            $location.path('/');
        };
    }])
/**
 * Enterprise new controller
 */
    .controller('newCtrl', ['$scope', '$location','enterpriseCrew', function ($scope, $location, enterpriseCrew) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            enterpriseCrew.push($scope.person);
            $location.path('/');
        };
    }]);
