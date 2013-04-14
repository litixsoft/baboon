/*global angular*/
angular.module('enterprise',[
        'enterpriseServices'
    ])
    .config(function($routeProvider){
        'use strict';
        $routeProvider.when('/',{templateUrl: '/views/enterprise.html', controller: 'listCtrl'});
        $routeProvider.when('/new',{templateUrl: '/views/enterpriseEdit.html', controller: 'newCtrl'});
        $routeProvider.when('/edit/:id',{templateUrl: '/views/enterpriseEdit.html', controller: 'editCtrl'});
    })
    .controller('listCtrl', ['$scope', 'enterpriseCrew', function($scope, enterpriseCrew) {
        'use strict';
    }])
    .controller('editCtrl', ['$scope', '$location', '$routeParams', function($scope, $location, $routeParams) {
        'use strict';

        $scope.person = $scope.enterpriseCrew[$routeParams.id];
        $scope.save = function () {
            $location.path('/');
        };
    }])
    .controller('newCtrl','$scope', '$location', '$routeParams' [function($scope, $location, $routeParams) {
        'use strict';

        $scope.person = {name: '', description: ''};
        $scope.save = function() {
            $scope.crew.push($scope.person);
            $location.path('/');
        };
    }]);